-- Security hardening (applied manually in dashboard; kept here for history / fresh installs)
-- Do not assume this has not already been run.

-- =============================================================================
-- 1. protect_profile_role: allow SQL editor / service role (auth.uid() is null)
-- =============================================================================

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

-- =============================================================================
-- 2. Tightened RLS policies
-- =============================================================================

-- profiles SELECT: own row, admin, supervised interns, or the intern's supervisor
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or exists (
      select 1
      from public.interns i
      where i.supervisor_id = auth.uid()
        and i.id = profiles.id
    )
    or exists (
      select 1
      from public.interns i
      where i.id = auth.uid()
        and i.supervisor_id = profiles.id
    )
  );

-- profiles INSERT: admin only (signup trigger is security definer / bypasses RLS)
drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin"
  on public.profiles for insert to authenticated
  with check (public.is_admin());

-- daily_logs INSERT: interns may only insert clean Submitted rows for themselves
drop policy if exists "daily_logs_insert" on public.daily_logs;
create policy "daily_logs_insert"
  on public.daily_logs for insert to authenticated
  with check (
    public.is_admin()
    or (
      public.current_role() = 'intern'
      and intern_id = auth.uid()
      and status = 'Submitted'
      and mentor_note = ''
      and reviewed_by is null
    )
  );

-- =============================================================================
-- 3. Function execute lockdown
-- =============================================================================

alter default privileges in schema public
  revoke execute on functions from public, anon, authenticated;

revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;

grant execute on function public.current_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_supervisor_of(uuid) to authenticated;
