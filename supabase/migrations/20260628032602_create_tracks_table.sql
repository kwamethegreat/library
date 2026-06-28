-- tracks: top-level content grouping (e.g. "Frontend", "Backend").
-- Courses belong to a track via track_id (added in the next migration).

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- slug must be URL-safe: lowercase letters, numbers, and hyphens only.
  constraint tracks_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- Reuse the updated_at trigger function created in the profiles migration.
create trigger tracks_set_updated_at
  before update on public.tracks
  for each row
  execute function public.set_updated_at();

-- Index for ordered, published-track listings (common query pattern).
create index tracks_published_sort_idx
  on public.tracks (published, sort_order);

comment on table public.tracks is
  'Top-level content grouping; courses belong to a track.';