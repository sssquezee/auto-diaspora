-- =============================================================
-- Auto Diaspora — Storage bucket + RLS for listing photos
-- Run AFTER schema.sql. Safe to re-run.
--
-- This replaces the manual "create bucket in the Dashboard" step:
-- the bucket is created here so the whole setup is one SQL run.
-- =============================================================

-- Public bucket so listing-card images are readable without a token.
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do update set public = true;

-- Anyone can read listing photos (bucket is public anyway, but this
-- makes the intent explicit and covers signed/list operations).
drop policy if exists "Anyone can view listing photos" on storage.objects;
create policy "Anyone can view listing photos"
  on storage.objects for select
  using (bucket_id = 'listings');

-- Users may upload only into a top-level folder named after their uid:
--   <auth.uid()>/<listingId>/<n>.<ext>
drop policy if exists "Users upload to own folder" on storage.objects;
create policy "Users upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own photos" on storage.objects;
create policy "Users update own photos"
  on storage.objects for update
  using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own photos" on storage.objects;
create policy "Users delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
