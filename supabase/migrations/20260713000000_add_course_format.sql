-- Adds `format` to courses: the sprint/masterclass distinction shown on the
-- course detail page (item 111).
--
-- SEMANTICS (intent, not length):
--   sprint      -> ship ONE thing, fast. A focused build with a concrete
--                  deliverable at the end.
--   masterclass -> MASTER a domain. Depth and breadth over a subject area,
--                  not a single artifact.
--
-- Deliberately NOT derived from lesson/module count: a 3-lesson course can be a
-- masterclass and a 12-lesson course can be a sprint. Intent is an editorial
-- decision, so it gets its own column.
--
-- Nullable (same approach as `category` in the catalog-filters migration): the
-- constraint tolerates existing/uncategorised rows, and can be tightened to NOT
-- NULL once every course is classified.

alter table public.courses
  add column format text;

alter table public.courses
  add constraint courses_format_check
  check (format is null or format = any (array['sprint', 'masterclass']));

-- Equality filter facet (the catalog may filter on it later).
create index if not exists courses_format_idx
  on public.courses (format);

comment on column public.courses.format is
  'Editorial intent: sprint = ship one thing fast; masterclass = master a domain. Not derived from length.';
