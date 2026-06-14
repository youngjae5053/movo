-- Movo initial schema
-- Run in Supabase SQL Editor or via Supabase CLI migrations.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Helper: updated_at (no table dependency)
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Tables (dependency order: trainers → members → child tables)
-- ---------------------------------------------------------------------------

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  name text not null,
  email text,
  phone text not null,
  age integer not null check (age > 0 and age <= 120),
  goal text not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'paused')),
  joined_at date not null default current_date,
  last_workout_at date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.workout_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  record_date date not null,
  content text,
  title text,
  duration integer check (duration is null or duration > 0),
  exercises text[],
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  sender text not null check (sender in ('trainer', 'member')),
  content text not null,
  sent_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  schedule_date date not null,
  schedule_time time not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'pending')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------

create index members_trainer_id_idx on public.members (trainer_id);
create index members_status_idx on public.members (status);

create index workout_records_member_id_idx on public.workout_records (member_id);
create index workout_records_trainer_id_idx on public.workout_records (trainer_id);
create index workout_records_record_date_idx on public.workout_records (record_date desc);

create index messages_member_id_idx on public.messages (member_id);
create index messages_trainer_id_idx on public.messages (trainer_id);
create index messages_sent_at_idx on public.messages (sent_at desc);

create index schedules_trainer_id_idx on public.schedules (trainer_id);
create index schedules_member_id_idx on public.schedules (member_id);
create index schedules_schedule_date_idx on public.schedules (schedule_date);

-- ---------------------------------------------------------------------------
-- 4. Helper functions (after tables exist)
-- ---------------------------------------------------------------------------

create or replace function public.current_trainer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.trainers
  where auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.enforce_member_trainer_match()
returns trigger
language plpgsql
as $$
declare
  member_trainer_id uuid;
begin
  select trainer_id
  into member_trainer_id
  from public.members
  where id = new.member_id;

  if member_trainer_id is null then
    raise exception 'Member not found for member_id %', new.member_id;
  end if;

  if new.trainer_id <> member_trainer_id then
    raise exception 'trainer_id must match the member''s trainer_id';
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Triggers
-- ---------------------------------------------------------------------------

create trigger trainers_set_updated_at
before update on public.trainers
for each row
execute function public.set_updated_at();

create trigger members_set_updated_at
before update on public.members
for each row
execute function public.set_updated_at();

create trigger workout_records_set_updated_at
before update on public.workout_records
for each row
execute function public.set_updated_at();

create trigger workout_records_enforce_member_trainer_match
before insert or update on public.workout_records
for each row
execute function public.enforce_member_trainer_match();

create trigger messages_enforce_member_trainer_match
before insert or update on public.messages
for each row
execute function public.enforce_member_trainer_match();

create trigger schedules_set_updated_at
before update on public.schedules
for each row
execute function public.set_updated_at();

create trigger schedules_enforce_member_trainer_match
before insert or update on public.schedules
for each row
execute function public.enforce_member_trainer_match();

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.trainers enable row level security;
alter table public.members enable row level security;
alter table public.workout_records enable row level security;
alter table public.messages enable row level security;
alter table public.schedules enable row level security;

-- trainers
create policy "trainers_select_own"
on public.trainers
for select
to authenticated
using (auth_user_id = auth.uid());

create policy "trainers_insert_own"
on public.trainers
for insert
to authenticated
with check (auth_user_id = auth.uid());

create policy "trainers_update_own"
on public.trainers
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "trainers_delete_own"
on public.trainers
for delete
to authenticated
using (auth_user_id = auth.uid());

-- members
create policy "members_select_own_trainer"
on public.members
for select
to authenticated
using (trainer_id = public.current_trainer_id());

create policy "members_insert_own_trainer"
on public.members
for insert
to authenticated
with check (trainer_id = public.current_trainer_id());

create policy "members_update_own_trainer"
on public.members
for update
to authenticated
using (trainer_id = public.current_trainer_id())
with check (trainer_id = public.current_trainer_id());

create policy "members_delete_own_trainer"
on public.members
for delete
to authenticated
using (trainer_id = public.current_trainer_id());

-- workout_records
create policy "workout_records_select_own_trainer"
on public.workout_records
for select
to authenticated
using (trainer_id = public.current_trainer_id());

create policy "workout_records_insert_own_trainer"
on public.workout_records
for insert
to authenticated
with check (trainer_id = public.current_trainer_id());

create policy "workout_records_update_own_trainer"
on public.workout_records
for update
to authenticated
using (trainer_id = public.current_trainer_id())
with check (trainer_id = public.current_trainer_id());

create policy "workout_records_delete_own_trainer"
on public.workout_records
for delete
to authenticated
using (trainer_id = public.current_trainer_id());

-- messages
create policy "messages_select_own_trainer"
on public.messages
for select
to authenticated
using (trainer_id = public.current_trainer_id());

create policy "messages_insert_own_trainer"
on public.messages
for insert
to authenticated
with check (trainer_id = public.current_trainer_id());

create policy "messages_update_own_trainer"
on public.messages
for update
to authenticated
using (trainer_id = public.current_trainer_id())
with check (trainer_id = public.current_trainer_id());

create policy "messages_delete_own_trainer"
on public.messages
for delete
to authenticated
using (trainer_id = public.current_trainer_id());

-- schedules
create policy "schedules_select_own_trainer"
on public.schedules
for select
to authenticated
using (trainer_id = public.current_trainer_id());

create policy "schedules_insert_own_trainer"
on public.schedules
for insert
to authenticated
with check (trainer_id = public.current_trainer_id());

create policy "schedules_update_own_trainer"
on public.schedules
for update
to authenticated
using (trainer_id = public.current_trainer_id())
with check (trainer_id = public.current_trainer_id());

create policy "schedules_delete_own_trainer"
on public.schedules
for delete
to authenticated
using (trainer_id = public.current_trainer_id());

-- ---------------------------------------------------------------------------
-- Optional: auto-create trainer profile after signup
-- Uncomment if you want a DB trigger on auth.users.
-- ---------------------------------------------------------------------------
-- create or replace function public.handle_new_trainer_user()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path = public
-- as $$
-- begin
--   insert into public.trainers (auth_user_id, name, email)
--   values (
--     new.id,
--     coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
--     new.email
--   );
--   return new;
-- end;
-- $$;
--
-- create trigger on_auth_user_created
-- after insert on auth.users
-- for each row
-- execute function public.handle_new_trainer_user();
