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
 * PostgREST's error code for "Requested range not satisfiable" -- returned when
 * a range's starting offset lies past the end of the result set (e.g. ?page=2
 * when the filters only match a single page). We treat that as an empty page
 * rather than a failure; see getPublishedCourses.
 */
const PGRST_RANGE_NOT_SATISFIABLE = "PGRST103";

/**
 * Filters for the published-courses catalog query. All optional. `trackId` is
 * the resolved track UUID (the caller maps the URL's track slug to an id). The
 * asset-flag filters and labActive only NARROW when true -- a false/omitted
 * flag means "don't filter by it", not "must be false". `search` is a free-text
 * query run against the full-text search_vector (title + description).
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
  search?: string;
}

/** A one-based page request. */
export interface CoursePagination {
  page: number;
  pageSize: number;
}

/** A page of courses plus the total match count, for pagination controls. */
export interface PaginatedCourses {
  courses: CourseCardData[];
  /**
   * Total published rows matching `filters` across ALL pages (not just the
   * returned slice). Respects RLS + the same filters, so it's the correct
   * denominator for page-count math.
   */
  total: number;
}

/**
 * Count published courses matching `filters`, without fetching any rows
 * (`head: true` sends no body). Only used on the range-past-the-end fallback,
 * where we need a true total to compute the last valid page.
 *
 * NOTE: the filter chain here must stay in sync with getPublishedCourses.
 */
async function countPublishedCourses(filters: CourseFilters): Promise<number> {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
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

  const search = filters.search?.trim();
  if (search) {
    query = query.textSearch("search_vector", search, {
      type: "websearch",
      config: "english",
    });
  }

  const { error, count } = await query;

  if (error) {
    throw new Error(`Failed to count courses: ${error.message}`);
  }

  return count ?? 0;
}

/**
 * Published courses for the catalog, with optional filtering + full-text
 * search, ordered for display. When `pagination` is supplied, returns just that
 * page of results alongside the total match count.
 *
 * RLS restricts anon/authenticated callers to published rows; we also filter
 * explicitly (belt-and-suspenders), matching the rest of the data layer.
 */
export async function getPublishedCourses(
  filters: CourseFilters = {},
  pagination?: CoursePagination,
): Promise<PaginatedCourses> {
  const supabase = await createClient();

  // `count: "exact"` returns the total number of matching rows regardless of
  // the range applied below -- exactly what pagination needs.
  let query = supabase
    .from("courses")
    .select(COURSE_CARD_COLUMNS, { count: "exact" })
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

  const search = filters.search?.trim();
  if (search) {
    // Full-text search against the generated search_vector. `websearch` mode
    // parses the query like a search engine (quoted phrases, OR, -exclusion).
    query = query.textSearch("search_vector", search, {
      type: "websearch",
      config: "english",
    });
  }

  query = query.order("sort_order", { ascending: true });

  if (pagination) {
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    // Asking for a page past the end (stale link, hand-typed ?page=99, or a
    // filter change that shrank the result set) is a 416 from PostgREST, not a
    // real failure. Report it as an empty page with the TRUE total so callers
    // can compute the last valid page and redirect there.
    if (pagination && error.code === PGRST_RANGE_NOT_SATISFIABLE) {
      return { courses: [], total: await countPublishedCourses(filters) };
    }
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  // The DB CHECK constraints guarantee level / validation_lab_status /
  // access_level / category are valid unions; the generated types widen them to
  // string, so we assert the narrowed CourseCardData shape at this boundary.
  const courses: CourseCardData[] = (data ?? []).map((row) => ({
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

  return { courses, total: count ?? 0 };
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
