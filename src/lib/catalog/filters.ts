import type { AccessLevel } from "@/types/access";
import type { CourseCategory, CourseLevel } from "@/types/content";

/**
 * The canonical, typed representation of the catalog's filter state, parsed
 * from URL search params. The URL is the single source of truth for filters
 * (so every view is shareable/bookmarkable); this is its validated, typed form,
 * consumed by both the filter UI and the server-side fetcher.
 *
 * Note: `track` is the track SLUG (as it appears in the URL). Resolving it to a
 * track_id for querying happens at fetch time.
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
}

const LEVELS = ["beginner", "intermediate", "advanced"] as const;
const ACCESS = ["free", "paid", "enterprise"] as const;
const CATEGORIES = ["LEARN", "PROJ", "AUTO", "CAREER"] as const;

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
 */
export function parseCatalogFilters(params: ParamsInput): CatalogFilterState {
  const get = reader(params);
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
  };
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
      state.labActive,
  );
}
