-- Make workout-media bucket private and remove public read access

update storage.buckets
set public = false
where id = 'workout-media';

drop policy if exists "workout_media_storage_public_read" on storage.objects;

-- Members can read their own media files (path: trainerId/memberId/recordId/file)
create policy "workout_media_storage_select_member"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'workout-media'
  and (storage.foldername(name))[2] = public.current_member_id()::text
);
