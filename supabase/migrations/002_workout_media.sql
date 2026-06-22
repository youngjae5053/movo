-- Workout record media (photos & videos) + Supabase Storage

-- ---------------------------------------------------------------------------
-- 1. Media metadata table
-- ---------------------------------------------------------------------------

create table public.workout_record_media (
  id uuid primary key default gen_random_uuid(),
  workout_record_id uuid not null references public.workout_records (id) on delete cascade,
  trainer_id uuid not null references public.trainers (id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  file_name text,
  mime_type text,
  file_size integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index workout_record_media_record_id_idx
  on public.workout_record_media (workout_record_id);

create index workout_record_media_trainer_id_idx
  on public.workout_record_media (trainer_id);

-- ---------------------------------------------------------------------------
-- 2. Storage bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workout-media',
  'workout-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/mpeg'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 3. RLS — workout_record_media
-- ---------------------------------------------------------------------------

alter table public.workout_record_media enable row level security;

create policy "workout_media_select_own_trainer"
on public.workout_record_media
for select
to authenticated
using (trainer_id = public.current_trainer_id());

create policy "workout_media_insert_own_trainer"
on public.workout_record_media
for insert
to authenticated
with check (trainer_id = public.current_trainer_id());

create policy "workout_media_delete_own_trainer"
on public.workout_record_media
for delete
to authenticated
using (trainer_id = public.current_trainer_id());

-- ---------------------------------------------------------------------------
-- 4. Storage policies
-- ---------------------------------------------------------------------------

create policy "workout_media_storage_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'workout-media'
  and (storage.foldername(name))[1] = public.current_trainer_id()::text
);

create policy "workout_media_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'workout-media'
  and (storage.foldername(name))[1] = public.current_trainer_id()::text
);

create policy "workout_media_storage_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'workout-media'
  and (storage.foldername(name))[1] = public.current_trainer_id()::text
);

-- Public read for shared workout-media URLs (trainer-scoped paths)
create policy "workout_media_storage_public_read"
on storage.objects
for select
to public
using (bucket_id = 'workout-media');
