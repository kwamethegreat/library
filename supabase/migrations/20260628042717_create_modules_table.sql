-- modules: mid-level grouping within a course. Lessons belong to a module.

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- URL-safe slug (same rule as tracks/courses).
  constraint modules_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  -- Slug must be unique WITHIN a course, not globally.
  constraint modules_course_slug_unique unique (course_id, slug)
);

create trigger modules_set_updated_at
  before update on public.modules
  for each row
  execute function public.set_updated_at();

-- Index for listing a course's published modules in order.
create index modules_course_published_sort_idx
  on public.modules (course_id, published, sort_order);

comment on table public.modules is
  'Mid-level grouping within a course; lessons belong to a module.';