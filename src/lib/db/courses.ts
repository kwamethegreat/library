import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";
import type { AccessLevel } from "@/types/access";
import type {
  CourseCardData,
  CourseCategory,
  CourseLevel,
  ValidationLabStatus,
} from "@/types/content";

export type Course = Tables<"courses">;

/** Columns the catalog card needs -- keep in sync with CourseCardData. */
const COURSE_CARD_COLUMNS =
  "id, slug, title, system_moat_identifier, code_asset_flag, validation_lab_status, level, access_level, category, track_id, has_scaffold, has_gist, has_sandbox, has_local_mirror";

/**
 * Filters for the published-courses catalog query. All optional. `trackId` is
 * the resolved track UUID (the caller maps the URL's track slug to an id). The
 * asset-flag filters and labActive only NARROW when true -- a false/omitted
 * flag means "don't filter by it", not "must be false".
 */
export interface CourseFilters {
  trackId?: string;
  level?: CourseLevel;
  accessLevel?: AccessLevel;
  category?: CourseCategory;
  hasScaffold?: boolean;
  hasGist?: boolean;
  hasSandbox?: boolean;
  hasLocalMirror?: boolean;
  labActive?: boolean;
}

/**
 * Published courses for the catalog, with optional filtering, ordered for
 * display. Returns the lean CourseCardData shape (only the columns the
 * CourseCard renders), not full rows.
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
  if (filters.category) {
    query = query.eq("category", filters.category);
  }
  if (filters.hasScaffold) {
    query = query.eq("has_scaffold", true);
  }
  if (filters.hasGist) {
    query = query.eq("has_gist", true);
  }
  if (filters.hasSandbox) {
    query = query.eq("has_sandbox", true);
  }
  if (filters.hasLocalMirror) {
    query = query.eq("has_local_mirror", true);
  }
  if (filters.labActive) {
    query = query.eq("validation_lab_status", "active");
  }

  const { data, error } = await query.order("sort_order", {
    ascending: true,
  });

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  // The DB CHECK constraints guarantee level / validation_lab_status /
  // access_level / category are valid unions; the generated types widen them to
  // string, so we assert the narrowed CourseCardData shape at this boundary.
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    system_moat_identifier: row.system_moat_identifier,
    code_asset_flag: row.code_asset_flag,
    validation_lab_status: row.validation_lab_status as ValidationLabStatus,
    level: row.level as CourseLevel,
    access_level: row.access_level as AccessLevel,
    category: row.category as CourseCategory | null,
    track_id: row.track_id,
    has_scaffold: row.has_scaffold,
    has_gist: row.has_gist,
    has_sandbox: row.has_sandbox,
    has_local_mirror: row.has_local_mirror,
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
