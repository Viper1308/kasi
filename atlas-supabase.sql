-- ============================================================
--  ATLAS — extra Supabase setup
--  Paste into Supabase → SQL Editor → New query → Run.
--  Safe to run more than once. Does not touch your existing
--  kv table or images bucket.
-- ============================================================

-- Written entries live in their own table rather than in kv,
-- because each one is 8-12 KB and there will eventually be
-- hundreds. Keeping them out of kv means pullAll() on login
-- stays small and fast, and localStorage never fills up.
create table if not exists public.atlas_entries (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  sheet      text        not null,        -- e.g. economics, gen-music-theory-a1b2
  tid        text        not null,        -- "sectionIndex-topicIndex", e.g. 3-7
  topic      text,                        -- readable name, for searching later
  parts      jsonb       not null,        -- [{tag, body}, ...] the five passes
  updated_at timestamptz not null default now(),
  primary key (user_id, sheet, tid)
);

-- Same row-level security model as the rest of your data:
-- each user can see only their own rows.
alter table public.atlas_entries enable row level security;

drop policy if exists "own atlas entries" on public.atlas_entries;
create policy "own atlas entries" on public.atlas_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Makes "which entries exist for this sheet?" instant.
create index if not exists atlas_entries_sheet_idx
  on public.atlas_entries (user_id, sheet);

-- Full-text search across everything you have ever had written.
-- Optional, but it costs nothing and you will want it eventually.
create index if not exists atlas_entries_topic_idx
  on public.atlas_entries using gin (to_tsvector('english', coalesce(topic, '')));

-- Done. Go back to the app.
