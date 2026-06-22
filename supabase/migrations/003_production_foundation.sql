-- Production foundation: member auth, soft delete, legal, payments schema, RPCs

-- ---------------------------------------------------------------------------
-- 1. Helper: current member
-- ---------------------------------------------------------------------------

create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.members
  where auth_user_id = auth.uid()
    and deleted_at is null
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- 2. Schema extensions
-- ---------------------------------------------------------------------------

alter table public.trainers
  add column if not exists center_name text,
  add column if not exists phone text,
  add column if not exists onboarding_completed_at timestamptz;

alter table public.members
  add column if not exists auth_user_id uuid unique references auth.users (id) on delete set null,
  add column if not exists privacy_consent_at timestamptz,
  add column if not exists terms_consent_at timestamptz,
  add column if not exists deleted_at timestamptz;

alter table public.workout_records
  add column if not exists deleted_at timestamptz;

alter table public.schedules
  add column if not exists deleted_at timestamptz,
  add column if not exists cancelled_at timestamptz;

create index if not exists members_auth_user_id_idx on public.members (auth_user_id);
create index if not exists members_deleted_at_idx on public.members (deleted_at);
create index if not exists workout_records_deleted_at_idx on public.workout_records (deleted_at);
create index if not exists schedules_deleted_at_idx on public.schedules (deleted_at);

-- ---------------------------------------------------------------------------
-- 3. Member invites
-- ---------------------------------------------------------------------------

create table if not exists public.member_invites (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  expires_at timestamptz not null default timezone('utc', now()) + interval '7 days',
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists member_invites_token_idx on public.member_invites (token);
create index if not exists member_invites_member_id_idx on public.member_invites (member_id);

alter table public.member_invites enable row level security;

create policy "member_invites_select_own_trainer"
on public.member_invites for select to authenticated
using (trainer_id = public.current_trainer_id());

create policy "member_invites_insert_own_trainer"
on public.member_invites for insert to authenticated
with check (trainer_id = public.current_trainer_id());

create policy "member_invites_update_own_trainer"
on public.member_invites for update to authenticated
using (trainer_id = public.current_trainer_id())
with check (trainer_id = public.current_trainer_id());

-- ---------------------------------------------------------------------------
-- 4. Data requests (export / deletion — PIPA)
-- ---------------------------------------------------------------------------

create table if not exists public.data_requests (
  id uuid primary key default gen_random_uuid(),
  requester_role text not null check (requester_role in ('trainer', 'member')),
  requester_auth_id uuid not null references auth.users (id) on delete cascade,
  member_id uuid references public.members (id) on delete set null,
  trainer_id uuid references public.trainers (id) on delete set null,
  request_type text not null check (request_type in ('export', 'deletion')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'rejected')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create index if not exists data_requests_status_idx on public.data_requests (status);

alter table public.data_requests enable row level security;

create policy "data_requests_select_own"
on public.data_requests for select to authenticated
using (requester_auth_id = auth.uid());

create policy "data_requests_insert_own"
on public.data_requests for insert to authenticated
with check (requester_auth_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 5. Session packages & payments (schema for future Stripe)
-- ---------------------------------------------------------------------------

create table if not exists public.session_packages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  label text not null default 'PT 패키지',
  total_sessions integer not null check (total_sessions > 0),
  used_sessions integer not null default 0 check (used_sessions >= 0),
  expires_at date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  session_package_id uuid references public.session_packages (id) on delete set null,
  amount integer not null check (amount > 0),
  currency text not null default 'KRW',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  stripe_payment_intent_id text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.session_packages enable row level security;
alter table public.payments enable row level security;

create policy "session_packages_trainer_all"
on public.session_packages for all to authenticated
using (trainer_id = public.current_trainer_id())
with check (trainer_id = public.current_trainer_id());

create policy "session_packages_member_select"
on public.session_packages for select to authenticated
using (member_id = public.current_member_id());

create policy "payments_trainer_all"
on public.payments for all to authenticated
using (trainer_id = public.current_trainer_id())
with check (trainer_id = public.current_trainer_id());

create policy "payments_member_select"
on public.payments for select to authenticated
using (member_id = public.current_member_id());

-- ---------------------------------------------------------------------------
-- 6. Member RLS policies (additive)
-- ---------------------------------------------------------------------------

create policy "members_select_self"
on public.members for select to authenticated
using (auth_user_id = auth.uid() and deleted_at is null);

create policy "members_update_self"
on public.members for update to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "workout_records_select_self_member"
on public.workout_records for select to authenticated
using (
  member_id = public.current_member_id()
  and deleted_at is null
);

create policy "messages_select_self_member"
on public.messages for select to authenticated
using (member_id = public.current_member_id());

create policy "messages_insert_self_member"
on public.messages for insert to authenticated
with check (
  member_id = public.current_member_id()
  and sender = 'member'
);

create policy "messages_update_self_member"
on public.messages for update to authenticated
using (member_id = public.current_member_id())
with check (member_id = public.current_member_id());

create policy "schedules_select_self_member"
on public.schedules for select to authenticated
using (
  member_id = public.current_member_id()
  and deleted_at is null
);

create policy "workout_media_select_self_member"
on public.workout_record_media for select to authenticated
using (
  workout_record_id in (
    select wr.id
    from public.workout_records wr
    where wr.member_id = public.current_member_id()
      and wr.deleted_at is null
  )
);

-- ---------------------------------------------------------------------------
-- 7. Atomic schedule + message
-- ---------------------------------------------------------------------------

create or replace function public.create_schedule_with_message(
  p_member_id uuid,
  p_trainer_id uuid,
  p_schedule_date date,
  p_schedule_time time,
  p_message_content text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_schedule_id uuid;
  v_member_trainer uuid;
begin
  if p_trainer_id <> public.current_trainer_id() then
    raise exception 'Unauthorized trainer';
  end if;

  select trainer_id into v_member_trainer
  from public.members
  where id = p_member_id and deleted_at is null;

  if v_member_trainer is null or v_member_trainer <> p_trainer_id then
    raise exception 'Member not found';
  end if;

  if exists (
    select 1 from public.schedules s
    where s.trainer_id = p_trainer_id
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
    p_member_id, p_trainer_id, p_schedule_date, p_schedule_time, 'confirmed'
  )
  returning id into v_schedule_id;

  insert into public.messages (
    member_id, trainer_id, sender, content
  ) values (
    p_member_id, p_trainer_id, 'trainer', p_message_content
  );

  return v_schedule_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. Chat previews RPC (avoid N+1)
-- ---------------------------------------------------------------------------

create or replace function public.get_trainer_chat_previews()
returns table (
  member_id uuid,
  member_name text,
  preview text,
  sent_at timestamptz,
  unread_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with trainer_members as (
    select m.id, m.name
    from public.members m
    where m.trainer_id = public.current_trainer_id()
      and m.deleted_at is null
  ),
  latest as (
    select distinct on (msg.member_id)
      msg.member_id,
      msg.content as preview,
      msg.sent_at
    from public.messages msg
    join trainer_members tm on tm.id = msg.member_id
    order by msg.member_id, msg.sent_at desc
  ),
  unread as (
    select msg.member_id, count(*) as unread_count
    from public.messages msg
    join trainer_members tm on tm.id = msg.member_id
    where msg.sender = 'member' and msg.read_at is null
    group by msg.member_id
  )
  select
    tm.id as member_id,
    tm.name as member_name,
    coalesce(l.preview, '대화를 시작해보세요') as preview,
    l.sent_at,
    coalesce(u.unread_count, 0) as unread_count
  from trainer_members tm
  left join latest l on l.member_id = tm.id
  left join unread u on u.member_id = tm.id
  order by coalesce(u.unread_count, 0) desc, l.sent_at desc nulls last, tm.name;
$$;

grant execute on function public.create_schedule_with_message(uuid, uuid, date, time, text) to authenticated;
grant execute on function public.get_trainer_chat_previews() to authenticated;

-- ---------------------------------------------------------------------------
-- 9. Member invite RPCs (anon can validate; auth completes)
-- ---------------------------------------------------------------------------

create or replace function public.get_member_invite_by_token(p_token text)
returns table (
  member_id uuid,
  member_name text,
  member_email text,
  member_phone text
)
language sql
security definer
set search_path = public
as $$
  select m.id, m.name, m.email, m.phone
  from public.member_invites i
  join public.members m on m.id = i.member_id
  where i.token = p_token
    and i.used_at is null
    and i.expires_at > timezone('utc', now())
    and m.deleted_at is null;
$$;

create or replace function public.complete_member_invite(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.member_invites%rowtype;
  v_email text;
begin
  select * into v_invite
  from public.member_invites
  where token = p_token
    and used_at is null
    and expires_at > timezone('utc', now())
  for update;

  if not found then
    raise exception '유효하지 않거나 만료된 초대 링크입니다.';
  end if;

  select coalesce(
    nullif(m.email, ''),
    regexp_replace(m.phone, '\D', '', 'g') || '@member.movo.local'
  )
  into v_email
  from public.members m
  where m.id = v_invite.member_id;

  update public.members
  set
    auth_user_id = auth.uid(),
    email = v_email,
    privacy_consent_at = timezone('utc', now()),
    terms_consent_at = timezone('utc', now())
  where id = v_invite.member_id;

  update public.member_invites
  set used_at = timezone('utc', now())
  where id = v_invite.id;
end;
$$;

grant execute on function public.get_member_invite_by_token(text) to anon, authenticated;
grant execute on function public.complete_member_invite(text) to authenticated;
