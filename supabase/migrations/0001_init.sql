-- Intern MS — initial schema, helpers, RLS, and column-guard triggers
-- Run in Supabase SQL Editor or via: supabase db push
-- Idempotent where practical (IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS)

create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. profiles (created first so helpers can reference it)
-- =============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  title text not null default '',
  department text not null default '',
  avatar_url text,
  role text not null default 'intern'
    check (role in ('admin', 'supervisor', 'intern')),
  -- Supervisor-only fields (null / unused for other roles)
  capacity integer check (capacity is null or capacity >= 0),
  supervisor_status text
    check (
      supervisor_status is null
      or supervisor_status in ('Active', 'On leave', 'Inactive')
    ),
  supervisor_start_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

-- =============================================================================
-- 2. Helpers (security definer, locked search_path)
-- =============================================================================

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role = 'admin' from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    'intern' -- ALWAYS intern; ignore any role in signup metadata
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Only admins may change profiles.role
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Allow the SQL Editor / service role (no end-user JWT).
  -- Logged-in app users always have a uid, so they remain blocked.
  if auth.uid() is null then
    new.updated_at := now();
    return new;
  end if;

  if tg_op = 'UPDATE'
     and new.role is distinct from old.role
     and not public.is_admin() then
    raise exception 'Only admins can change profiles.role';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before update on public.profiles
  for each row
  execute function public.protect_profile_role();

-- =============================================================================
-- 3. programmes + supervisor ↔ programme links
-- =============================================================================

create table if not exists public.programmes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cohort text not null default '',
  description text not null default '',
  lead_supervisor_id uuid references public.profiles (id) on delete set null,
  start_date date,
  end_date date,
  capacity integer not null default 0 check (capacity >= 0),
  status text not null default 'Upcoming'
    check (status in ('Active', 'Upcoming', 'Completed', 'Paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists programmes_status_idx on public.programmes (status);
create index if not exists programmes_lead_supervisor_id_idx
  on public.programmes (lead_supervisor_id);

create table if not exists public.supervisor_programmes (
  supervisor_id uuid not null references public.profiles (id) on delete cascade,
  programme_id uuid not null references public.programmes (id) on delete cascade,
  primary key (supervisor_id, programme_id)
);

create index if not exists supervisor_programmes_programme_id_idx
  on public.supervisor_programmes (programme_id);

-- =============================================================================
-- 4. interns (id = profiles.id for intern users)
-- =============================================================================

create table if not exists public.interns (
  id uuid primary key references public.profiles (id) on delete cascade,
  programme_id uuid references public.programmes (id) on delete set null,
  supervisor_id uuid references public.profiles (id) on delete set null,
  start_date date,
  end_date date,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'Onboarding'
    check (status in ('Active', 'Onboarding', 'Paused', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interns_supervisor_id_idx on public.interns (supervisor_id);
create index if not exists interns_programme_id_idx on public.interns (programme_id);
create index if not exists interns_status_idx on public.interns (status);

create or replace function public.is_supervisor_of(p_intern_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.interns i
    where i.id = p_intern_id
      and i.supervisor_id = auth.uid()
  );
$$;

-- =============================================================================
-- 5. tasks
-- =============================================================================

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  intern_id uuid not null references public.interns (id) on delete cascade,
  assigned_by uuid references public.profiles (id) on delete set null,
  due_date date,
  priority text not null default 'Medium'
    check (priority in ('High', 'Medium', 'Low')),
  status text not null default 'In progress'
    check (status in ('In progress', 'Review', 'Overdue', 'Done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_intern_id_idx on public.tasks (intern_id);
create index if not exists tasks_assigned_by_idx on public.tasks (assigned_by);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists tasks_due_date_idx on public.tasks (due_date);

-- Interns may change only status; supervisors/admins may edit fully
create or replace function public.protect_task_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role text := public.current_role();
begin
  if caller_role = 'intern' then
    if auth.uid() is distinct from old.intern_id then
      raise exception 'Interns can only update their own tasks';
    end if;
    if new.title is distinct from old.title
       or new.description is distinct from old.description
       or new.intern_id is distinct from old.intern_id
       or new.assigned_by is distinct from old.assigned_by
       or new.due_date is distinct from old.due_date
       or new.priority is distinct from old.priority then
      raise exception 'Interns may only update tasks.status';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_protect_task_columns on public.tasks;
create trigger trg_protect_task_columns
  before update on public.tasks
  for each row
  execute function public.protect_task_columns();

-- =============================================================================
-- 6. daily_logs (attendance / daily reflections)
-- =============================================================================

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.interns (id) on delete cascade,
  log_date date not null,
  hours numeric(4, 1) not null default 0 check (hours >= 0),
  summary text not null default '',
  blockers text not null default '',
  tomorrow text not null default '',
  status text not null default 'Submitted'
    check (status in ('Submitted', 'Reviewed', 'Flagged')),
  mentor_note text not null default '',
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_logs_intern_id_idx on public.daily_logs (intern_id);
create index if not exists daily_logs_log_date_idx on public.daily_logs (log_date);
create index if not exists daily_logs_status_idx on public.daily_logs (status);

create or replace function public.protect_daily_log_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_role text := public.current_role();
begin
  if caller_role = 'intern' then
    if auth.uid() is distinct from old.intern_id then
      raise exception 'Interns can only update their own daily logs';
    end if;
    if new.status is distinct from old.status
       or new.mentor_note is distinct from old.mentor_note
       or new.reviewed_by is distinct from old.reviewed_by
       or new.intern_id is distinct from old.intern_id then
      raise exception 'Interns cannot change daily log status, mentor_note, or ownership';
    end if;
  elsif caller_role = 'supervisor' then
    if not public.is_supervisor_of(old.intern_id) then
      raise exception 'Supervisors can only update logs for their interns';
    end if;
    if new.summary is distinct from old.summary
       or new.blockers is distinct from old.blockers
       or new.tomorrow is distinct from old.tomorrow
       or new.hours is distinct from old.hours
       or new.log_date is distinct from old.log_date
       or new.intern_id is distinct from old.intern_id then
      raise exception 'Supervisors cannot edit intern daily log content';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_protect_daily_log_columns on public.daily_logs;
create trigger trg_protect_daily_log_columns
  before update on public.daily_logs
  for each row
  execute function public.protect_daily_log_columns();

-- =============================================================================
-- 7. reviews (evaluations / feedback)
-- =============================================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  intern_id uuid not null references public.interns (id) on delete cascade,
  reviewer_id uuid references public.profiles (id) on delete set null,
  type text not null
    check (type in ('Task', 'Daily log', 'Mid-programme', 'Final')),
  submitted_at date,
  due_date date,
  status text not null default 'Pending'
    check (status in ('Pending', 'In progress', 'Completed')),
  outcome text not null default 'Pending'
    check (outcome in ('Approved', 'Needs changes', 'Pending')),
  feedback text not null default '',
  task_id uuid references public.tasks (id) on delete set null,
  daily_log_id uuid references public.daily_logs (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_intern_id_idx on public.reviews (intern_id);
create index if not exists reviews_reviewer_id_idx on public.reviews (reviewer_id);
create index if not exists reviews_status_idx on public.reviews (status);
create index if not exists reviews_type_idx on public.reviews (type);

-- =============================================================================
-- 8. programme_modules (persisted progress)
-- =============================================================================

create table if not exists public.programme_modules (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.interns (id) on delete cascade,
  title text not null,
  description text not null default '',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'Upcoming'
    check (status in ('Completed', 'In progress', 'Upcoming', 'Blocked')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists programme_modules_intern_id_idx
  on public.programme_modules (intern_id);
create index if not exists programme_modules_status_idx
  on public.programme_modules (status);

-- =============================================================================
-- 9. intern_profiles + user_settings + org_settings
-- =============================================================================

create table if not exists public.intern_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  bio text not null default '',
  skills text[] not null default '{}',
  location text not null default '',
  university text not null default '',
  linkedin text not null default '',
  github text not null default '',
  emergency_name text not null default '',
  emergency_phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  notifications jsonb not null default '{
    "emailAlerts": true,
    "inAppAlerts": true,
    "taskReminders": true,
    "dailyLogReminders": true,
    "weeklyDigest": false
  }'::jsonb,
  preferences jsonb not null default '{
    "compactTables": false,
    "showAvatarsInTables": true,
    "dateFormat": "en-ZA",
    "startOfWeek": "monday"
  }'::jsonb,
  privacy jsonb not null default '{
    "showOnlineStatus": true,
    "shareEmailWithTeam": true,
    "allowMessageRequests": true
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.org_settings (
  id boolean primary key default true check (id),
  organisation_name text not null default 'InkDot Internships',
  default_intern_capacity integer not null default 10 check (default_intern_capacity >= 0),
  require_enrolment_approval boolean not null default true,
  log_reminder_hour integer not null default 16
    check (log_reminder_hour >= 0 and log_reminder_hour <= 23),
  report_retention_days integer not null default 90 check (report_retention_days >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.org_settings (id)
values (true)
on conflict (id) do nothing;

-- =============================================================================
-- 10. Row Level Security
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.programmes enable row level security;
alter table public.supervisor_programmes enable row level security;
alter table public.interns enable row level security;
alter table public.tasks enable row level security;
alter table public.daily_logs enable row level security;
alter table public.reviews enable row level security;
alter table public.programme_modules enable row level security;
alter table public.intern_profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.org_settings enable row level security;

-- ----- profiles -----
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or public.current_role() = 'supervisor'
  );

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin"
  on public.profiles for insert to authenticated
  with check (public.is_admin() or id = auth.uid());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
  on public.profiles for delete to authenticated
  using (public.is_admin());

-- ----- programmes -----
drop policy if exists "programmes_select_authenticated" on public.programmes;
create policy "programmes_select_authenticated"
  on public.programmes for select to authenticated
  using (true);

drop policy if exists "programmes_write_admin" on public.programmes;
create policy "programmes_write_admin"
  on public.programmes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----- supervisor_programmes -----
drop policy if exists "supervisor_programmes_select_authenticated"
  on public.supervisor_programmes;
create policy "supervisor_programmes_select_authenticated"
  on public.supervisor_programmes for select to authenticated
  using (true);

drop policy if exists "supervisor_programmes_write_admin"
  on public.supervisor_programmes;
create policy "supervisor_programmes_write_admin"
  on public.supervisor_programmes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----- interns -----
drop policy if exists "interns_select" on public.interns;
create policy "interns_select"
  on public.interns for select to authenticated
  using (
    public.is_admin()
    or id = auth.uid()
    or supervisor_id = auth.uid()
  );

drop policy if exists "interns_insert_admin" on public.interns;
create policy "interns_insert_admin"
  on public.interns for insert to authenticated
  with check (public.is_admin());

drop policy if exists "interns_update" on public.interns;
create policy "interns_update"
  on public.interns for update to authenticated
  using (
    public.is_admin()
    or supervisor_id = auth.uid()
  )
  with check (
    public.is_admin()
    or supervisor_id = auth.uid()
  );

drop policy if exists "interns_delete_admin" on public.interns;
create policy "interns_delete_admin"
  on public.interns for delete to authenticated
  using (public.is_admin());

-- ----- tasks -----
drop policy if exists "tasks_select" on public.tasks;
create policy "tasks_select"
  on public.tasks for select to authenticated
  using (
    public.is_admin()
    or intern_id = auth.uid()
    or public.is_supervisor_of(intern_id)
  );

drop policy if exists "tasks_insert" on public.tasks;
create policy "tasks_insert"
  on public.tasks for insert to authenticated
  with check (
    public.is_admin()
    or public.is_supervisor_of(intern_id)
  );

drop policy if exists "tasks_update" on public.tasks;
create policy "tasks_update"
  on public.tasks for update to authenticated
  using (
    public.is_admin()
    or intern_id = auth.uid()
    or public.is_supervisor_of(intern_id)
  )
  with check (
    public.is_admin()
    or intern_id = auth.uid()
    or public.is_supervisor_of(intern_id)
  );

drop policy if exists "tasks_delete" on public.tasks;
create policy "tasks_delete"
  on public.tasks for delete to authenticated
  using (
    public.is_admin()
    or public.is_supervisor_of(intern_id)
  );

-- ----- daily_logs -----
drop policy if exists "daily_logs_select" on public.daily_logs;
create policy "daily_logs_select"
  on public.daily_logs for select to authenticated
  using (
    public.is_admin()
    or intern_id = auth.uid()
    or public.is_supervisor_of(intern_id)
  );

drop policy if exists "daily_logs_insert" on public.daily_logs;
create policy "daily_logs_insert"
  on public.daily_logs for insert to authenticated
  with check (
    public.is_admin()
    or (
      public.current_role() = 'intern'
      and intern_id = auth.uid()
    )
  );

drop policy if exists "daily_logs_update" on public.daily_logs;
create policy "daily_logs_update"
  on public.daily_logs for update to authenticated
  using (
    public.is_admin()
    or intern_id = auth.uid()
    or public.is_supervisor_of(intern_id)
  )
  with check (
    public.is_admin()
    or intern_id = auth.uid()
    or public.is_supervisor_of(intern_id)
  );

drop policy if exists "daily_logs_delete" on public.daily_logs;
create policy "daily_logs_delete"
  on public.daily_logs for delete to authenticated
  using (
    public.is_admin()
    or (
      public.current_role() = 'intern'
      and intern_id = auth.uid()
    )
  );

-- ----- reviews -----
drop policy if exists "reviews_select" on public.reviews;
create policy "reviews_select"
  on public.reviews for select to authenticated
  using (
    public.is_admin()
    or intern_id = auth.uid()
    or public.is_supervisor_of(intern_id)
  );

drop policy if exists "reviews_insert" on public.reviews;
create policy "reviews_insert"
  on public.reviews for insert to authenticated
  with check (
    public.is_admin()
    or public.is_supervisor_of(intern_id)
  );

drop policy if exists "reviews_update" on public.reviews;
create policy "reviews_update"
  on public.reviews for update to authenticated
  using (
    public.is_admin()
    or public.is_supervisor_of(intern_id)
  )
  with check (
    public.is_admin()
    or public.is_supervisor_of(intern_id)
  );

drop policy if exists "reviews_delete" on public.reviews;
create policy "reviews_delete"
  on public.reviews for delete to authenticated
  using (
    public.is_admin()
    or public.is_supervisor_of(intern_id)
  );

-- ----- programme_modules -----
drop policy if exists "programme_modules_select" on public.programme_modules;
create policy "programme_modules_select"
  on public.programme_modules for select to authenticated
  using (
    public.is_admin()
    or intern_id = auth.uid()
    or public.is_supervisor_of(intern_id)
  );

drop policy if exists "programme_modules_write" on public.programme_modules;
create policy "programme_modules_write"
  on public.programme_modules for all to authenticated
  using (
    public.is_admin()
    or public.is_supervisor_of(intern_id)
  )
  with check (
    public.is_admin()
    or public.is_supervisor_of(intern_id)
  );

-- ----- intern_profiles (own row only; admin can manage) -----
drop policy if exists "intern_profiles_select" on public.intern_profiles;
create policy "intern_profiles_select"
  on public.intern_profiles for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "intern_profiles_insert_own" on public.intern_profiles;
create policy "intern_profiles_insert_own"
  on public.intern_profiles for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "intern_profiles_update_own" on public.intern_profiles;
create policy "intern_profiles_update_own"
  on public.intern_profiles for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "intern_profiles_delete_own" on public.intern_profiles;
create policy "intern_profiles_delete_own"
  on public.intern_profiles for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ----- user_settings (own row only; admin can manage all) -----
drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own"
  on public.user_settings for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own"
  on public.user_settings for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own"
  on public.user_settings for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "user_settings_delete_own" on public.user_settings;
create policy "user_settings_delete_own"
  on public.user_settings for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ----- org_settings -----
drop policy if exists "org_settings_select_authenticated" on public.org_settings;
create policy "org_settings_select_authenticated"
  on public.org_settings for select to authenticated
  using (true);

drop policy if exists "org_settings_write_admin" on public.org_settings;
create policy "org_settings_write_admin"
  on public.org_settings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- Grants (table-level; column rules enforced by triggers above)
-- =============================================================================

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- =============================================================================
-- Function privileges (SECURITY DEFINER lockdown)
-- =============================================================================

-- Future functions in public: no execute for public / anon / authenticated by default
alter default privileges in schema public
  revoke execute on functions from public, anon, authenticated;

-- Existing functions: revoke broadly, then grant only what RLS/clients need
revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;

-- Helpers used inside RLS policies (and callable by authenticated clients)
grant execute on function public.current_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_supervisor_of(uuid) to authenticated;

-- Trigger-only functions stay revoked from clients:
--   public.handle_new_user()
--   public.protect_profile_role()
--   public.protect_task_columns()
--   public.protect_daily_log_columns()
