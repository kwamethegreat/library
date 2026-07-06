import { redirect } from "next/navigation";
import { Suspense } from "react";

import { CatalogFilters } from "@/components/content/CatalogFilters";
import { CatalogPagination } from "@/components/content/CatalogPagination";
import { CatalogSearch } from "@/components/content/CatalogSearch";
import {
  CourseGrid,
  CourseGridSkeleton,
} from "@/components/content/CourseGrid";
import { TrackTabs } from "@/components/content/TrackTabs";
import {
  CATALOG_PAGE_SIZE,
  parseCatalogFilters,
  parseCatalogPage,
} from "@/lib/catalog/filters";
import { getPublishedCourses, getPublishedTracks } from "@/lib/db";
import type { CourseFilters } from "@/lib/db/courses";

export const metadata = {
  title: "Catalog",
};

/**
 * Async server component: fetches one page of courses (plus the total count)
 * for the given filters and renders the grid + pagination. Isolated so the page
 * can wrap it in <Suspense> -- the tabs/search/filters render immediately while
 * the query resolves.
 */
async function CatalogResults({
  filters,
  page,
  buildPageHref,
}: {
  filters: CourseFilters;
  page: number;
  buildPageHref: (page: number) => string;
}) {
  const { courses, total } = await getPublishedCourses(filters, {
    page,
    pageSize: CATALOG_PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));

  // Guard against paging past the end -- a stale/shared link, a hand-typed
  // `?page=99`, or a filter change that shrank the result set. Bounce to the
  // last real page so we never render an empty grid that reads as "no matches".
  if (page > totalPages) {
    redirect(buildPageHref(totalPages));
  }

  return (
    <>
      <CourseGrid
        courses={courses}
        emptyMessage="No courses match your search or filters."
      />
      <CatalogPagination
        currentPage={page}
        totalPages={totalPages}
        buildPageHref={buildPageHref}
      />
    </>
  );
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filterState = parseCatalogFilters(params);
  const page = parseCatalogPage(params);

  // Tracks power the tabs + the track filter; also used to resolve the track
  // slug from the URL to a track_id for the query.
  const tracks = await getPublishedTracks();
  const trackId = filterState.track
    ? tracks.find((t) => t.slug === filterState.track)?.id
    : undefined;

  // Map the URL-derived filter state to the fetcher's shape.
  const courseFilters: CourseFilters = {
    trackId,
    level: filterState.level,
    accessLevel: filterState.access,
    category: filterState.category,
    hasScaffold: filterState.hasScaffold,
    hasGist: filterState.hasGist,
    hasSandbox: filterState.hasSandbox,
    hasLocalMirror: filterState.hasLocalMirror,
    labActive: filterState.labActive,
    search: filterState.search,
  };

  // Build a page URL that preserves the current filters/search/track and only
  // adds `?page` when > 1, so page one stays the canonical, clean URL.
  const buildPageHref = (targetPage: number): string => {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page") continue;
      if (Array.isArray(value)) {
        for (const v of value) sp.append(key, v);
      } else if (value !== undefined) {
        sp.set(key, value);
      }
    }
    if (targetPage > 1) {
      sp.set("page", String(targetPage));
    }
    const qs = sp.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Catalog</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Browse challenges across tracks.
      </p>

      <div className="mb-6">
        <CatalogSearch />
      </div>

      <div className="mb-6">
        <TrackTabs tracks={tracks} activeTrack={filterState.track} />
      </div>

      <div className="mb-8">
        <CatalogFilters tracks={tracks} />
      </div>

      {/* Re-suspend when filters/search/page change so the skeleton shows
          during each new fetch. */}
      <Suspense
        key={`${JSON.stringify(courseFilters)}|page:${page}`}
        fallback={<CourseGridSkeleton />}
      >
        <CatalogResults
          filters={courseFilters}
          page={page}
          buildPageHref={buildPageHref}
        />
      </Suspense>
    </div>
  );
}
