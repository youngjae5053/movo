-- Member schedule request RPC

create or replace function public.request_member_schedule(
  p_schedule_date date,
  p_schedule_time time
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid;
  v_trainer_id uuid;
  v_member_name text;
  v_schedule_id uuid;
  v_time text;
begin
  v_member_id := public.current_member_id();
  if v_member_id is null then
    raise exception 'Member not authenticated';
  end if;

  select trainer_id, name into v_trainer_id, v_member_name
  from public.members
  where id = v_member_id and deleted_at is null;

  if v_trainer_id is null then
    raise exception 'Member not found';
  end if;

  if exists (
    select 1 from public.schedules s
    where s.trainer_id = v_trainer_id
      and s.schedule_date = p_schedule_date
      and s.schedule_time = p_schedule_time
      and s.deleted_at is null
      and s.cancelled_at is null
  ) then
    raise exception 'Schedule conflict';
  end if;

  insert into public.schedules (
    member_id, trainer_id, schedule_date, schedule_time, status
  ) values (
    v_member_id, v_trainer_id, p_schedule_date, p_schedule_time, 'pending'
  )
  returning id into v_schedule_id;

  v_time := to_char(p_schedule_time, 'HH24:MI');

  insert into public.messages (
    member_id, trainer_id, sender, content
  ) values (
    v_member_id,
    v_trainer_id,
    'member',
    v_member_name || '님 예약 요청: ' || p_schedule_date || ' ' || v_time
  );

  return v_schedule_id;
end;
$$;

grant execute on function public.request_member_schedule(date, time) to authenticated;

create or replace function public.cancel_member_schedule(p_schedule_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_id uuid;
begin
  v_member_id := public.current_member_id();
  if v_member_id is null then
    raise exception 'Member not authenticated';
  end if;

  update public.schedules
  set cancelled_at = now(), status = 'pending', updated_at = now()
  where id = p_schedule_id
    and member_id = v_member_id
    and deleted_at is null
    and cancelled_at is null;

  if not found then
    raise exception 'Schedule not found';
  end if;
end;
$$;

grant execute on function public.cancel_member_schedule(uuid) to authenticated;
