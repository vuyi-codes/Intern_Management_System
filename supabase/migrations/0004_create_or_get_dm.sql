-- Reliable DM creation (avoids INSERT…RETURNING RLS gap on empty conversations).

create or replace function public.create_or_get_dm(p_other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_conversation_id uuid;
begin
  if v_me is null then
    raise exception 'Not authenticated';
  end if;

  if p_other_user_id is null or p_other_user_id = v_me then
    raise exception 'Invalid conversation participant';
  end if;

  -- Supervisor ↔ assigned intern, or admin
  if not (
    public.is_admin()
    or public.is_supervisor_of(p_other_user_id)
    or exists (
      select 1
      from public.interns i
      where i.id = v_me
        and i.supervisor_id = p_other_user_id
    )
  ) then
    raise exception 'Not allowed to message this user';
  end if;

  select cp1.conversation_id
  into v_conversation_id
  from public.conversation_participants cp1
  inner join public.conversation_participants cp2
    on cp1.conversation_id = cp2.conversation_id
  where cp1.user_id = v_me
    and cp2.user_id = p_other_user_id
  limit 1;

  if v_conversation_id is not null then
    return v_conversation_id;
  end if;

  insert into public.conversations default values
  returning id into v_conversation_id;

  insert into public.conversation_participants (conversation_id, user_id)
  values
    (v_conversation_id, v_me),
    (v_conversation_id, p_other_user_id);

  return v_conversation_id;
end;
$$;

revoke all on function public.create_or_get_dm(uuid) from public, anon;
grant execute on function public.create_or_get_dm(uuid) to authenticated;
