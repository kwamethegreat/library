-- Local development seed data.
-- Runs automatically AFTER migrations on `supabase db reset` and `supabase start`.
-- Uses fixed UUIDs so child rows can reference parents directly, and
-- ON CONFLICT DO NOTHING so it's safe to re-run.
--
-- Includes a deliberate MIX for RLS testing (next step):
--   - published vs unpublished
--   - free vs paid
--   - one free public-preview lesson

-- ===================== Tracks =====================
insert into public.tracks (id, slug, title, description, sort_order, published)
values
  ('11111111-1111-1111-1111-111111111111', 'frontend', 'Frontend Engineering', 'Build modern, accessible web interfaces.', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'backend', 'Backend Engineering', 'APIs, databases, and distributed systems.', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'draft-track', 'Draft Track', 'Not yet published - should be hidden from anon.', 3, false)
on conflict (id) do nothing;

-- ===================== Courses =====================
insert into public.courses (id, track_id, slug, title, description, level, access_level, published, sort_order, category, has_scaffold, has_gist, has_sandbox, has_local_mirror)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'intro-to-react', 'Intro to React', 'React fundamentals from scratch.', 'beginner', 'free', true, 1, 'LEARN', true, true, false, false),
  ('aaaaaaaa-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'advanced-react', 'Advanced React', 'Patterns, performance, and architecture.', 'advanced', 'paid', true, 2, 'PROJ', true, false, true, true),
  ('aaaaaaaa-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'intro-to-postgres', 'Intro to Postgres', 'Relational databases and SQL.', 'beginner', 'free', true, 1, 'AUTO', false, true, false, false)
on conflict (id) do nothing;

-- ===================== Modules =====================
insert into public.modules (id, course_id, slug, title, description, sort_order, published)
values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'getting-started', 'Getting Started', 'Setup and core ideas.', 1, true),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'components', 'Components', 'Building with components.', 2, true),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', 'performance', 'Performance', 'Optimizing render behavior.', 1, true)
on conflict (id) do nothing;

-- ===================== Lessons =====================
insert into public.lessons (id, module_id, slug, title, lesson_number, summary, body_markdown, access_level, is_public_preview, published)
values
  -- The required FREE PUBLIC lesson (free access_level + public preview + published).
  ('cccccccc-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'what-is-react', 'What is React?', 1, 'A gentle introduction to React.', 'React is a library for building user interfaces from components.', 'free', true, true),
  -- Free, published, not a preview.
  ('cccccccc-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', 'environment-setup', 'Setting Up Your Environment', 2, 'Install the tooling you need.', 'Install Node, then create your first app.', 'free', false, true),
  -- Paid, published (should be hidden from direct anon reads of content).
  ('cccccccc-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000003', 'memoization-deep-dive', 'Memoization Deep Dive', 1, 'useMemo and useCallback in depth.', 'Memoization avoids unnecessary recomputation.', 'paid', false, true),
  -- Unpublished draft (should be hidden from anon entirely).
  ('cccccccc-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000002', 'draft-lesson', 'Draft Lesson', 3, 'Work in progress.', 'This lesson is not published yet.', 'free', false, false)
on conflict (id) do nothing;