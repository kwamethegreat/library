-- Performance indexes: fill gaps not already covered by inline indexes or by
-- the indexes Postgres auto-creates for unique constraints / primary keys.
-- IF NOT EXISTS guards against accidentally duplicating an existing index.

-- FK index for course -> track lookups standalone.
-- (courses_track_published_sort_idx already leads with track_id, so this is
--  usually redundant — included only if you query track_id without published.)
-- Skipping: covered by the leading column of the existing composite.

-- modules.course_id: covered by modules_course_published_sort_idx (leads with course_id).
-- lessons.module_id: covered by lessons_module_published_number_idx.
-- assets.lesson_id: covered by assets_lesson_idx.
-- code_assets.lesson_id: covered by code_assets_lesson_published_idx.
-- user_progress.user_id: covered by user_progress_user_idx.

-- Genuine gaps below:

-- audit_events.created_at already indexed; no slug tables missing slug indexes
-- because unique constraints auto-index them.

-- Standalone published-flag indexes for fast "all published X" scans that
-- don't also filter by the parent FK (e.g. a global published-courses feed).
create index if not exists courses_published_idx
  on public.courses (published)
  where published = true;

create index if not exists lessons_published_idx
  on public.lessons (published)
  where published = true;

create index if not exists modules_published_idx
  on public.modules (published)
  where published = true;

-- Composite for the very common "ordered lessons in a module" without the
-- published filter (admin views unpublished too).
create index if not exists lessons_module_number_idx
  on public.lessons (module_id, lesson_number);