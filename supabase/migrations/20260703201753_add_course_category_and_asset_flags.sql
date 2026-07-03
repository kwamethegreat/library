-- Adds catalog-filter columns to courses, denormalized for join-free filtering.
--
-- category: one of four operational pillars (CHECK-constrained, not a lookup
-- table -- fixed curriculum, so a column avoids join overhead).
-- has_* flags: presence of high-value deliverables, filtered directly off the
-- courses row (no join to an assets table).

-- 1. Category. Nullable for now so existing rows don't violate the constraint;
--    tighten to NOT NULL later once all courses are categorized.
alter table public.courses
  add column category text;

alter table public.courses
  add constraint courses_category_check
  check (category is null or category = any (array['LEARN', 'PROJ', 'AUTO', 'CAREER']));

-- 2. Asset-type flags. Default false; a course opts in per deliverable.
alter table public.courses
  add column has_scaffold boolean not null default false,
  add column has_gist boolean not null default false,
  add column has_sandbox boolean not null default false,
  add column has_local_mirror boolean not null default false;

-- 3. Indexes to keep filter queries fast.
--    category is a common filter facet; a btree index covers equality.
create index if not exists courses_category_idx
  on public.courses (category);

-- Partial indexes on the flags: only index rows where the flag is true, since
-- filters ask "courses that HAVE X". Small, cheap, and exactly matches the query.
create index if not exists courses_has_scaffold_idx
  on public.courses (has_scaffold) where has_scaffold;
create index if not exists courses_has_gist_idx
  on public.courses (has_gist) where has_gist;
create index if not exists courses_has_sandbox_idx
  on public.courses (has_sandbox) where has_sandbox;
create index if not exists courses_has_local_mirror_idx
  on public.courses (has_local_mirror) where has_local_mirror;
