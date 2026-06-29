-- Public read access to PUBLISHED content only.
-- Grants SELECT (read) to anon + authenticated roles, filtered to published rows.
-- Unpublished (draft) rows remain invisible. No write access is granted here.

-- tracks
create policy "Public can read published tracks"
  on public.tracks
  for select
  to anon, authenticated
  using (published = true);

-- courses
create policy "Public can read published courses"
  on public.courses
  for select
  to anon, authenticated
  using (published = true);

-- modules
create policy "Public can read published modules"
  on public.modules
  for select
  to anon, authenticated
  using (published = true);

-- lessons
create policy "Public can read published lessons"
  on public.lessons
  for select
  to anon, authenticated
  using (published = true);