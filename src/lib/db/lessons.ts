import { getViewerEntitlement } from "@/lib/entitlement";
import { getLessonAccessState } from "@/lib/entitlement/rules";
import type { LessonAccessState } from "@/lib/entitlement/rules";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";
import type { AccessLevel } from "@/types/access";
import type { VideoProvider } from "@/types/content";

export type Lesson = Tables<"lessons">;

/** A single published lesson by slug, or null if not found / not visible. */
export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lesson: ${error.message}`);
  }

  return data;
}

/**
 * Safe lesson metadata -- present for FREE and PAID lessons alike, never
 * including the payload. This is what lets a locked lesson render a preview
 * and a paywall instead of a 404.
 */
export interface LessonMeta {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  lesson_number: number;
  summary: string | null;
  access_level: AccessLevel;
  is_public_preview: boolean;
  video_provider: VideoProvider | null;
  has_video: boolean;
  course_slug: string;
  course_title: string;
}

/** The payload, present only when the viewer is entitled. */
export interface LessonContent {
  body_markdown: string | null;
  video_provider: VideoProvider | null;
  video_asset_id: string | null;
}

/**
 * A lesson resolved for a specific viewer: always the metadata, plus the
 * payload only when entitled.
 */
export interface LessonForViewer {
  meta: LessonMeta;
  accessState: LessonAccessState;
  /** Null when the viewer is not entitled -- render the paywall instead. */
  content: LessonContent | null;
}

/**
 * Resolve a lesson for the CURRENT viewer, enforcing access server-side.
 * (item 131)
 *
 * Two-step by design:
 *   1. get_lesson_meta  -- always returns safe metadata (free or paid), so a
 *                          locked lesson can render a preview + paywall.
 *   2. get_lesson_content -- returns the payload ONLY if the DB agrees the
 *                          caller is entitled (lesson free, or active/trialing
 *                          subscription). A non-entitled caller gets zero rows.
 *
 * DEFENSE IN DEPTH: the authoritative gate is in Postgres (get_lesson_content's
 * WHERE clause). The TypeScript entitlement check below decides what to RENDER;
 * it is not what protects the payload. Even if this code were wrong, the
 * database would not hand over a paid body to an unentitled caller.
 *
 * Returns null only when the lesson genuinely doesn't exist / isn't published,
 * so the page can 404. "Locked" is NOT null -- it's a real result with
 * content === null.
 */
export async function getLessonForViewer(
  slug: string,
): Promise<LessonForViewer | null> {
  const supabase = await createClient();

  const { data: metaRows, error: metaError } = await supabase.rpc(
    "get_lesson_meta",
    { p_slug: slug },
  );

  if (metaError) {
    throw new Error(`Failed to fetch lesson: ${metaError.message}`);
  }

  const metaRow = metaRows?.[0];
  if (!metaRow) {
    return null;
  }

  const meta: LessonMeta = {
    id: metaRow.id,
    module_id: metaRow.module_id,
    slug: metaRow.slug,
    title: metaRow.title,
    lesson_number: metaRow.lesson_number,
    summary: metaRow.summary,
    access_level: metaRow.access_level as AccessLevel,
    is_public_preview: metaRow.is_public_preview,
    video_provider: metaRow.video_provider as VideoProvider | null,
    has_video: metaRow.has_video,
    course_slug: metaRow.course_slug,
    course_title: metaRow.course_title,
  };

  const entitlement = await getViewerEntitlement();
  const accessState = getLessonAccessState(meta, entitlement);

  // Only ask for the payload when the app-side rules say the viewer may have
  // it. The DB re-checks regardless -- this just avoids a pointless round trip.
  if (accessState !== "visible") {
    return { meta, accessState, content: null };
  }

  const { data: contentRows, error: contentError } = await supabase.rpc(
    "get_lesson_content",
    { p_slug: slug },
  );

  if (contentError) {
    throw new Error(`Failed to fetch lesson content: ${contentError.message}`);
  }

  const contentRow = contentRows?.[0];

  // Zero rows here means the DB disagreed with our app-side decision. Treat it
  // as locked (fail closed) rather than rendering an empty lesson.
  if (!contentRow) {
    return { meta, accessState: "locked", content: null };
  }

  return {
    meta,
    accessState,
    content: {
      body_markdown: contentRow.body_markdown,
      video_provider: contentRow.video_provider as VideoProvider | null,
      video_asset_id: contentRow.video_asset_id,
    },
  };
}
