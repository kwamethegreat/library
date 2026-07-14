-- Local development seed data.
-- Runs automatically AFTER migrations on `supabase db reset` and `supabase start`.
-- Uses fixed UUIDs so child rows can reference parents directly, and
-- ON CONFLICT DO NOTHING so it's safe to re-run.
--
-- Includes a deliberate MIX for RLS testing:
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
  -- Paid, published. RLS must hide this row from anon/authenticated clients
  -- (they may still see its METADATA via get_course_lesson_outline()).
  ('cccccccc-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000003', 'memoization-deep-dive', 'Memoization Deep Dive', 1, 'useMemo and useCallback in depth.', 'Memoization avoids unnecessary recomputation.', 'paid', false, true),
  -- Unpublished draft (should be hidden from anon entirely -- rows AND metadata).
  ('cccccccc-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000002', 'draft-lesson', 'Draft Lesson', 3, 'Work in progress.', 'This lesson is not published yet.', 'free', false, false)
on conflict (id) do nothing;

-- ===================== Code assets (the Code Vault) =====================
-- Deliberate mix so the course page can be verified end to end:
--   - free + published      -> readable by the RLS client (body included)
--   - paid + published      -> row hidden by RLS; metadata visible via RPC (LOCKED)
--   - unpublished           -> invisible everywhere, rows and metadata alike
insert into public.code_assets (id, lesson_id, slug, title, description, asset_kind, language, code_body, storage_path, access_level, published)
values
  -- FREE, published: attached to the free public-preview lesson.
  ('dddddddd-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'first-component', 'Your First Component', 'A minimal function component.', 'snippet', 'tsx', 'export function Hello() {
  return <h1>Hello</h1>;
}', null, 'free', true),
  -- FREE, published: a config file for the setup lesson.
  ('dddddddd-0000-0000-0000-000000000002', 'cccccccc-0000-0000-0000-000000000002', 'tsconfig-starter', 'Starter tsconfig', 'Strict TypeScript config to start from.', 'config', 'json', '{
  "compilerOptions": { "strict": true }
}', null, 'free', true),
  -- PAID, published: the locked vault item on the paid lesson.
  ('dddddddd-0000-0000-0000-000000000003', 'cccccccc-0000-0000-0000-000000000003', 'memo-benchmark', 'Memoization Benchmark Harness', 'Measure render cost before and after memoizing.', 'repo', 'ts', 'const t0 = performance.now();', null, 'paid', true),
  -- PAID, published: a second locked item, storage-backed (no inline body).
  ('dddddddd-0000-0000-0000-000000000004', 'cccccccc-0000-0000-0000-000000000003', 'perf-scaffold', 'Performance Scaffold', 'Full project scaffold for the performance module.', 'file', 'plaintext', null, 'code-assets/advanced-react/perf-scaffold.zip', 'paid', true),
  -- UNPUBLISHED: must never appear, even as metadata.
  ('dddddddd-0000-0000-0000-000000000005', 'cccccccc-0000-0000-0000-000000000002', 'draft-snippet', 'Draft Snippet', 'Not ready yet.', 'snippet', 'ts', 'const draft = true;', null, 'free', false)
on conflict (id) do nothing;
