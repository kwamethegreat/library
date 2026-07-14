-- Course-detail data access (Phase 5, item 110).
--
-- Two problems this migration fixes:
--
-- 1) PAYWALL LEAK (security). The existing lessons policy was:
--        using (published = true)
--    with NO access_level check -- so `body_markdown` and `video_asset_id` of a
--    PUBLISHED PAID lesson were readable by anyone holding the publishable
--    (anon) key, which ships in the browser. The assets/code_assets policies
--    already gate on access_level = 'free'; lessons did not. The seed even
--    documents the intent ("should be hidden from direct anon reads of
--    content"). We tighten lessons to match: clients can read FREE published
--    lesson rows only.
--
-- 2) LOCKED CONTENT MUST STILL BE *LISTABLE*. The course page has to show that
--    paid lessons and paid code assets EXIST (locked), or there is nothing to
--    upsell. But tightened RLS hides those rows entirely. So we expose
--    SAFE METADATA ONLY through SECURITY DEFINER functions that never select
--    the payload columns:
--        lessons     -> no body_markdown, no video_asset_id
--        code_assets -> no code_body, no storage_path
--
--    "See it exists" != "consume it". The payload stays behind a server-side
--    entitlement check (Phase 6 / 9).
--
-- These are FUNCTIONS, not security-definer VIEWS, deliberately: it mirrors the
-- existing ensure_profile_for_current_user() precedent, avoids the Supabase
-- security-definer-view lint, and works through the ordinary RLS client -- so it
-- is NOT blocked by the local service-role key quirk (SECURITY_NOTES section 8).

-- ============================================================
-- 1. Tighten the lessons paywall
-- ============================================================

drop policy if exists "Public can read published lessons" on public.lessons;

create policy "Public can read free published lessons"
  on public.lessons
  for select
  to anon, authenticated
  using (published = true and access_level = 'free');

-- ============================================================
-- 2. Safe lesson outline for a course (includes PAID lessons, metadata only)
-- ============================================================

create or replace function public.get_course_lesson_outline(p_course_id uuid)
returns table (
  id uuid,
  module_id uuid,
  slug text,
  title text,
  lesson_number integer,
  summary text,
  access_level text,
  is_public_preview boolean,
  video_provider text,
  has_video boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id,
    l.module_id,
    l.slug,
    l.title,
    l.lesson_number,
    l.summary,
    l.access_level,
    l.is_public_preview,
    l.video_provider,
    -- Whether a video exists, WITHOUT leaking the playback/asset id itself.
    (l.video_asset_id is not null) as has_video
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where c.id = p_course_id
    and c.published = true
    and m.published = true
    and l.published = true
  order by m.sort_order, l.lesson_number;
$$;

comment on function public.get_course_lesson_outline(uuid) is
  'Published lesson METADATA for a course, including paid lessons. Never returns body_markdown or video_asset_id.';

-- ============================================================
-- 3. Safe code-asset metadata for a course (includes PAID assets)
-- ============================================================

create or replace function public.get_course_code_assets(p_course_id uuid)
returns table (
  id uuid,
  lesson_id uuid,
  slug text,
  title text,
  description text,
  asset_kind text,
  language text,
  access_level text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ca.id,
    ca.lesson_id,
    ca.slug,
    ca.title,
    ca.description,
    ca.asset_kind,
    ca.language,
    ca.access_level
  from public.code_assets ca
  join public.lessons l on l.id = ca.lesson_id
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where c.id = p_course_id
    and c.published = true
    and m.published = true
    and l.published = true
    and ca.published = true
  order by l.lesson_number, ca.title;
$$;

comment on function public.get_course_code_assets(uuid) is
  'Published code-asset METADATA for a course, including paid assets. Never returns code_body or storage_path.';

-- ============================================================
-- 4. Grants
-- ============================================================
-- Metadata is safe for anonymous visitors: the course page is public, and the
-- whole point is to advertise locked content.

grant execute on function public.get_course_lesson_outline(uuid) to anon, authenticated;
grant execute on function public.get_course_code_assets(uuid) to anon, authenticated;
