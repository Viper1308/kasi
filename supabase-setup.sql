-- ============================================================
--  POLYMATH OS — Supabase setup
--  Paste this whole file into Supabase → SQL Editor → New query
--  → Run.  It's safe to run more than once.
-- ============================================================

-- 1. The table that holds all your text data (one row per key).
create table if not exists public.kv (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  k          text        not null,
  v          jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, k)
);

-- 2. Turn on Row Level Security so each user sees ONLY their own rows.
alter table public.kv enable row level security;

-- 3. Policy: a user can read/write only rows where user_id = their id.
drop policy if exists "own rows" on public.kv;
create policy "own rows" on public.kv
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
--  Storage bucket for vision-board images
--  (If the bucket already exists this is a no-op.)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('images', 'images', false)
on conflict (id) do nothing;

-- Each user can read/write only files inside a folder named after
-- their own user id  (path scheme:  {user_id}/{imageId}).
drop policy if exists "own images read"   on storage.objects;
drop policy if exists "own images write"  on storage.objects;
drop policy if exists "own images update" on storage.objects;
drop policy if exists "own images delete" on storage.objects;

create policy "own images read" on storage.objects
  for select using (
    bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "own images write" on storage.objects
  for insert with check (
    bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "own images update" on storage.objects
  for update using (
    bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "own images delete" on storage.objects
  for delete using (
    bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Done. Go back to the app and sign in.
