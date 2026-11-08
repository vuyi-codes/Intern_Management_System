-- Messaging, notifications, and avatar storage.
-- Do not assume this has been applied to a live project yet.

-- =============================================================================
-- 1. conversations + participants + messages
-- =============================================================================

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_participants_user_id_idx
  on public.conversation_participants (user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null default '',
  attachment_name text,
  attachment_size integer check (attachment_size is null or attachment_size >= 0),
  reactions text[] not null default '{}',
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx
  on public.messages (conversation_id, created_at);

create or replace function public.touch_conversation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_conversation_updated_at on public.messages;
create trigger trg_touch_conversation_updated_at
  before insert or update on public.messages
  for each row
  execute function public.touch_conversation_updated_at();

create or replace function public.is_conversation_participant(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = auth.uid()
  );
$$;

revoke all on function public.is_conversation_participant(uuid) from public, anon;
grant execute on function public.is_conversation_participant(uuid) to authenticated;

-- =============================================================================
-- 2. notifications
-- =============================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  detail text not null default '',
  href text not null default '',
  icon_key text not null default 'bell'
    check (icon_key in ('bell', 'task', 'log', 'review')),
  unread boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx
  on public.notifications (user_id, created_at desc);

-- =============================================================================
-- 3. RLS
-- =============================================================================

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "conversations_select_participant" on public.conversations;
create policy "conversations_select_participant"
  on public.conversations for select to authenticated
  using (public.is_conversation_participant(id));

drop policy if exists "conversations_insert_authenticated" on public.conversations;
create policy "conversations_insert_authenticated"
  on public.conversations for insert to authenticated
  with check (true);

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
  on public.conversations for update to authenticated
  using (public.is_conversation_participant(id))
  with check (public.is_conversation_participant(id));

drop policy if exists "conversations_delete_participant" on public.conversations;
create policy "conversations_delete_participant"
  on public.conversations for delete to authenticated
  using (public.is_conversation_participant(id));

drop policy if exists "conversation_participants_select" on public.conversation_participants;
create policy "conversation_participants_select"
  on public.conversation_participants for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_conversation_participant(conversation_id)
  );

drop policy if exists "conversation_participants_insert" on public.conversation_participants;
create policy "conversation_participants_insert"
  on public.conversation_participants for insert to authenticated
  with check (
    user_id = auth.uid()
    or public.is_admin()
    or public.is_supervisor_of(user_id)
    or exists (
      select 1
      from public.interns i
      where i.id = auth.uid()
        and i.supervisor_id = conversation_participants.user_id
    )
  );

drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant"
  on public.messages for select to authenticated
  using (public.is_conversation_participant(conversation_id));

drop policy if exists "messages_insert_own" on public.messages;
create policy "messages_insert_own"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_conversation_participant(conversation_id)
  );

drop policy if exists "messages_update_participant" on public.messages;
create policy "messages_update_participant"
  on public.messages for update to authenticated
  using (public.is_conversation_participant(conversation_id))
  with check (public.is_conversation_participant(conversation_id));

create or replace function public.protect_message_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.conversation_id is distinct from old.conversation_id
     or new.sender_id is distinct from old.sender_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Cannot change message ownership or conversation';
  end if;

  if auth.uid() is distinct from old.sender_id then
    if new.body is distinct from old.body
       or new.attachment_name is distinct from old.attachment_name
       or new.attachment_size is distinct from old.attachment_size
       or new.edited_at is distinct from old.edited_at then
      raise exception 'Only the sender can edit message content';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_message_columns on public.messages;
create trigger trg_protect_message_columns
  before update on public.messages
  for each row
  execute function public.protect_message_columns();

drop policy if exists "messages_delete_own_or_supervisor" on public.messages;
create policy "messages_delete_own_or_supervisor"
  on public.messages for delete to authenticated
  using (
    public.is_conversation_participant(conversation_id)
    and (
      sender_id = auth.uid()
      or exists (
        select 1
        from public.profiles p
        where p.id = auth.uid()
          and p.role = 'supervisor'
      )
    )
  );

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
  on public.notifications for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_insert_own_or_admin" on public.notifications;
create policy "notifications_insert_own_or_admin"
  on public.notifications for insert to authenticated
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
  on public.notifications for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
  on public.notifications for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- =============================================================================
-- 4. Avatar storage bucket
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select to public
  using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lock down helper execute grants for new functions
revoke all on function public.touch_conversation_updated_at() from public, anon, authenticated;
revoke all on function public.protect_message_columns() from public, anon, authenticated;
