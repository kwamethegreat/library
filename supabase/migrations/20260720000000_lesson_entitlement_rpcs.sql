-- Server-side lesson access enforcement (Phase 6, item 131).
--
-- After the item 110 paywall fix, the RLS policy on public.lessons only exposes
-- FREE published lessons to clients. That is correct -- paid lesson BODIES must
-- never be client-readable -- but it means a paid lesson currently 404s for
-- everyone, including subscribers, and we cannot render a preview + paywall.
--
-- This migration adds the entitlement-aware read path, with the gate ENFORCED
-- IN THE DATABASE rather than only in TypeScript:
--
--   has_active_subscription()  -> is the CALLER (auth.uid()) entitled?
--   get_lesson_meta(slug)      -> safe metadata for any published lesson
--                                 (free or paid). Never returns body_markdown
--                                 or video_asset_id. Powers the preview/paywall.
--   get_lesson_content(slug)   -> the PAYLOAD (body_markdown, video_asset_id),
--                                 returned ONLY when the lesson is free or the
--                                 caller has an active/trialing subscription.
--                                 Otherwise returns NO ROWS.
--
-- Why functions rather than loosening RLS: the entitlement test depends on the
-- caller's subscription, which is a per-row-per-user join. Encoding that in a
-- SECURITY DEFINER function keeps the rule in ONE place, keeps it enforced by
-- Postgres (defense in depth behind the TS helpers), and -- like the item 110
-- outline RPCs -- works through the ordinary RLS client, so it does NOT require
-- the service-role key (avoiding the SECURITY_NOTES section 8 local quirk).

-- ============================================================
-- 1. Is the calling user entitled to paid content?
-- ============================================================
-- Mirrors canAccessPaidContent() in src/lib/entitlement/rules.ts: ONLY
-- 'active' and 'trialing' grant access. Keep the two in sync -- if a grace
-- period is ever added for 'past_due', it must change in both places.

create or replace function public.has_active_subscription()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions s
    where s.user_id = auth.uid()
      and s.status in ('active', 'trialing')
  );
$$;

comment on function public.has_active_subscription() is
  'True when the calling user has an active or trialing subscription. Mirrors canAccessPaidContent() in the app.';

-- ============================================================
-- 2. Safe lesson metadata (works for PAID lessons too)
-- ============================================================
-- Returns no payload columns, so it is safe for anonymous callers: it is what
-- lets the workspace advertise a locked lesson (title, summary, "has video")
-- without disclosing its contents.

create or replace function public.get_lesson_meta(p_slug text)
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
  has_video boolean,
  course_slug text,
  course_title text
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
    (l.video_asset_id is not null) as has_video,
    c.slug as course_slug,
    c.title as course_title
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where l.slug = p_slug
    and l.published = true
    and m.published = true
    and c.published = true;
$$;

comment on function public.get_lesson_meta(text) is
  'Published lesson METADATA by slug, including paid lessons. Never returns body_markdown or video_asset_id.';

-- ============================================================
-- 3. Lesson PAYLOAD -- entitlement enforced here
-- ============================================================
-- Returns rows ONLY when the caller may consume the lesson:
--   * the lesson is free, OR
--   * the caller has an active/trialing subscription.
-- A non-entitled caller gets ZERO ROWS -- not an error, so the caller cannot
-- distinguish "locked" from "missing" by probing this function.
--
-- NOTE: enterprise-level lessons are intentionally NOT unlocked by a normal
-- subscription, matching canAccessLevel() in the app.

create or replace function public.get_lesson_content(p_slug text)
returns table (
  id uuid,
  slug text,
  body_markdown text,
  video_provider text,
  video_asset_id text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id,
    l.slug,
    l.body_markdown,
    l.video_provider,
    l.video_asset_id
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where l.slug = p_slug
    and l.published = true
    and m.published = true
    and c.published = true
    and (
      l.access_level = 'free'
      or (
        l.access_level = 'paid'
        and public.has_active_subscription()
      )
    );
$$;

comment on function public.get_lesson_content(text) is
  'Lesson payload (body/video) by slug, returned ONLY when the lesson is free or the caller has an active subscription. Zero rows otherwise.';

-- ============================================================
-- 4. Grants
-- ============================================================
-- Metadata: safe for anonymous visitors (that is the point -- advertise locked
-- lessons). Content: also granted to anon, but the function's own WHERE clause
-- is what gates it; an anonymous caller only ever gets free lessons.

grant execute on function public.has_active_subscription() to authenticated;
grant execute on function public.get_lesson_meta(text) to anon, authenticated;
grant execute on function public.get_lesson_content(text) to anon, authenticated;
