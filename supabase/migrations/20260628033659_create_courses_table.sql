-- courses: the core content unit. Belongs to a track; gated by access_level.

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks (id) on delete restrict,
  slug text not null unique,
  title text not null,
  description text,
  level text not null default 'beginner',
  access_level text not null default 'free',
  system_moat_identifier text,
  code_asset_flag boolean not null default false,
  validation_lab_status text not null default 'none',
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- URL-safe slug (same rule as tracks).
  constraint courses_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  -- access_level mirrors the AccessLevel union type (src/types/access.ts).
  constraint courses_access_level_check
    check (access_level in ('free', 'paid', 'enterprise')),

  -- difficulty level.
  constraint courses_level_check
    check (level in ('beginner', 'intermediate', 'advanced')),

  -- validation lab lifecycle.
  constraint courses_validation_lab_status_check
    check (validation_lab_status in ('none', 'draft', 'active', 'archived'))
);

create trigger courses_set_updated_at
  before update on public.courses
  for each row
  execute function public.set_updated_at();

-- Index for listing a track's published courses in order.
create index courses_track_published_sort_idx
  on public.courses (track_id, published, sort_order);

-- Index for filtering by access level (entitlement queries).
create index courses_access_level_idx
  on public.courses (access_level);

comment on table public.courses is
  'Core content unit; belongs to a track, gated by access_level.';