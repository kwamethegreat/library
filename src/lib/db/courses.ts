import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";
import type { AccessLevel } from "@/types/access";
import type {
  CourseCardData,
  CourseLevel,
  ValidationLabStatus,
} from "@/types/content";

export type Course = Tables<"courses">;

/** Columns the catalog card needs -- keep in sync with CourseCardData. */
const COURSE_CARD_COLUMNS =
  "id, slug, title, system_moat_identifier, code_asset_flag, validation_lab_status, level, access_level, track_id";

/** Filters for the published-courses catalog query. All optional. */
export interface CourseFilters {
  trackId?: string;
  level?: CourseLevel;
  /**
   * Filters the CATALOG by tier (e.g. "show only free courses"). This is
   * catalog filtering only -- it shows which courses EXIST at a tier. It does
   * NOT grant access to their content; consumption is gated separately by the
   * server-side entitlement check.
   */
  accessLevel?: AccessLevel;
}

/**
 * Published courses for the catalog, with optional track/level/access
 * filtering, ordered for display. Returns the lean CourseCardData shape (only
 * the columns the CourseCard renders), not full rows.
 *
 * RLS restricts anon/authenticated callers to published rows; we also filter
 * explicitly (belt-and-suspenders), matching the rest of the data layer.
 */
export async function getPublishedCourses(
  filters: CourseFilters = {},
): Promise<CourseCardData[]> {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select(COURSE_CARD_COLUMNS)
    .eq("published", true);

  if (filters.trackId) {
    query = query.eq("track_id", filters.trackId);
  }
  if (filters.level) {
    query = query.eq("level", filters.level);
  }
  if (filters.accessLevel) {
    query = query.eq("access_level", filters.accessLevel);
  }

  const { data, error } = await query.order("sort_order", {
    ascending: true,
  });

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  // The DB CHECK constraints guarantee level / validation_lab_status /
  // access_level are valid unions; the generated types widen them to string,
  // so we assert the narrowed CourseCardData shape at this boundary.
  return (data ?? []).map((row) => ({
    ...row,
    level: row.level as CourseLevel,
    validation_lab_status: row.validation_lab_status as ValidationLabStatus,
    access_level: row.access_level as AccessLevel,
  }));
}

/** Published courses within a track, ordered. */
export async function getPublishedCoursesByTrack(
  trackId: string,
): Promise<Course[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("track_id", trackId)
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
  return data ?? [];
}

/**
 * A single published course by slug, or null if not found / not visible.
 * Returns null (not throw) for "not found" so callers can render a 404.
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) {
    throw new Error(`Failed to fetch course: ${error.message}`);
  }
  return data;
}
