-- Full-text search for the catalog: a generated tsvector column over the
-- searchable text (title + description) with a GIN index. "challenge" == title
-- (courses are the challenges), so the vector covers title and description.
--
-- Generated STORED column stays in sync automatically on insert/update, is
-- indexable, and keeps search queries fast at scale (indexed GIN lookup rather
-- than a per-row ILIKE scan).
--
-- Weighting: title is weight 'A' (most important), description 'B', so title
-- matches rank higher when we order by relevance.

alter table public.courses
  add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) stored;

create index if not exists courses_search_vector_idx
  on public.courses using gin (search_vector);
