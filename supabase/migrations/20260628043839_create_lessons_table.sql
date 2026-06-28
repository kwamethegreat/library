-- lessons: leaf content unit. Belongs to a module. Holds the actual
-- lesson content (markdown body and/or video) and its own access gating.

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  slug text not null,
  title text not null,
  lesson_number integer not null default 0,
  summary text,
  body_markdown text,
  video_provider text,
  video_asset_id text,
  access_level text not null default 'free',
  is_public_preview boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- URL-safe slug.
  constraint lessons_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  -- Slug unique within a module (same scoped pattern as modules-in-course).
  constraint lessons_module_slug_unique unique (module_id, slug),

  -- access_level mirrors the AccessLevel union type.
  constraint lessons_access_level_check
    check (access_level in ('free', 'paid', 'enterprise')),

  -- video_provider, when set, must be a known provider.
  constraint lessons_video_provider_check
    check (
      video_provider is null
      or video_provider in ('mux', 'youtube', 'vimeo')
    )
);

create trigger lessons_set_updated_at
  before update on public.lessons
  for each row
  execute function public.set_updated_at();

-- Index for listing a module's published lessons in order.
create index lessons_module_published_number_idx
  on public.lessons (module_id, published, lesson_number);

-- Index for finding public-preview lessons (marketing/teaser queries).
create index lessons_public_preview_idx
  on public.lessons (is_public_preview)
  where is_public_preview = true;

comment on table public.lessons is
  'Leaf content unit; belongs to a module. Holds markdown/video content.';