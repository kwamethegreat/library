import type { AccessLevel } from "@/types/access";
import type { CourseCategory, CourseLevel } from "@/types/content";

/**
 * The canonical, typed representation of the catalog's filter state, parsed
 * from URL search params. The URL is the single source of truth for filters
 * (so every view is shareable/bookmarkable); this is its validated, typed form,
 * consumed by both the filter UI and the server-side fetcher.
 *
 * Note: `track` is the track SLUG (as it appears in the URL). Resolving it to a
 * track_id for querying happens at fetch time. Pagination (`page`) is parsed
 * separately via parseCatalogPage -- it's a view offset, not a content filter,
 * so it deliberately stays out of this state and out of hasActiveCatalogFilters.
 */
export interface CatalogFilterState {
  track?: string;
  level?: CourseLevel;
  access?: AccessLevel;
  category?: CourseCategory;
  hasScaffold: boolean;
  hasGist: boolean;
  hasSandbox: boolean;
  hasLocalMirror: boolean;
  labActive: boolean;
  search?: string;
}

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const ACCESS = ["free", "paid", "enterprise"] as const;
const CATEGORIES = ["LEARN", "PROJ", "AUTO", "CAREER"] as const;

/**
 * Minimum length for a search term to actually run a query. A single-character
 * term is near-useless against the full-text `search_vector` and just adds
 * noise to the URL, so we ignore anything shorter. Two characters is a
 * deliberate floor for this *technical* catalog: real terms like "js", "go",
 * "ts", "ai", "ml", "db", "ci" are two chars and must remain searchable, so we
 * do NOT go to three. Exported because the client search box uses the same
 * threshold to decide when to write `?q=` and when to show its "keep typing"
 * hint -- one source of truth, both layers agree.
 */
export const MIN_SEARCH_LENGTH = 2;

/**
 * How many courses render per catalog page. Kept here (next to the other
 * catalog constants) so the fetcher, the page, and any pagination UI all agree
 * on one number. 12 divides cleanly into the 1/2/3-column responsive grid.
 */
export const CATALOG_PAGE_SIZE = 12;

/** Returns `value` only if it's one of `allowed`; otherwise undefined. */
function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  return value && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

type ParamsInput =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

/** Reads a single string value from either params shape. */
function reader(params: ParamsInput) {
  return (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key) ?? undefined;
    }
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
}

/**
 * Parse URL search params (a Next.js `searchParams` object OR a URLSearchParams)
 * into a validated CatalogFilterState. Unknown/invalid enum values are ignored,
 * so a hand-edited URL like `?level=banana` simply yields no level filter.
 *
 * A too-short search term (below MIN_SEARCH_LENGTH) is dropped here as well, so
 * a hand-typed `/catalog?q=a` never reaches the fetcher and never runs a
 * one-character full-text query -- the client guard is UX, this is the
 * authoritative one.
 */
export function parseCatalogFilters(params: ParamsInput): CatalogFilterState {
  const get = reader(params);
  const rawSearch = get("q")?.trim();
  const search =
    rawSearch && rawSearch.length >= MIN_SEARCH_LENGTH ? rawSearch : undefined;
  return {
    track: get("track") || undefined,
    level: oneOf(get("level"), LEVELS),
    access: oneOf(get("access"), ACCESS),
    category: oneOf(get("category"), CATEGORIES),
    hasScaffold: get("has_scaffold") === "1",
    hasGist: get("has_gist") === "1",
    hasSandbox: get("has_sandbox") === "1",
    hasLocalMirror: get("has_local_mirror") === "1",
    labActive: get("lab") === "active",
    search,
  };
}

/**
 * Parse the requested catalog page (1-based). Anything invalid -- missing,
 * non-numeric, zero, or negative -- collapses to page 1. The upper bound is
 * enforced at fetch time (once we know how many pages exist), not here.
 */
export function parseCatalogPage(params: ParamsInput): number {
  const get = reader(params);
  const raw = get("page");
  const parsed = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

/** True if any filter is active. */
export function hasActiveCatalogFilters(state: CatalogFilterState): boolean {
  return Boolean(
    state.track ||
      state.level ||
      state.access ||
      state.category ||
      state.hasScaffold ||
      state.hasGist ||
      state.hasSandbox ||
      state.hasLocalMirror ||
      state.labActive ||
      state.search,
  );
}
