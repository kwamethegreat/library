import { Suspense } from "react";

import { CatalogFilters } from "@/components/content/CatalogFilters";
import {
  CourseGrid,
  CourseGridSkeleton,
} from "@/components/content/CourseGrid";
import { TrackTabs } from "@/components/content/TrackTabs";
import { parseCatalogFilters } from "@/lib/catalog/filters";
import { getPublishedCourses, getPublishedTracks } from "@/lib/db";
import type { CourseFilters } from "@/lib/db/courses";

export const metadata = {
  title: "Catalog",
};

/**
 * Async server component: fetches courses for the given filters and renders the
 * grid. Isolated in its own component so the page can wrap it in <Suspense> --
 * the tabs/filters render immediately while the (potentially filtered) course
 * query resolves.
 */
async function CatalogResults({ filters }: { filters: CourseFilters }) {
  const courses = await getPublishedCourses(filters);
  return (
    <CourseGrid
      courses={courses}
      emptyMessage="No courses match these filters."
    />
  );
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filterState = parseCatalogFilters(params);

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
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold text-foreground">Catalog</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Browse challenges across tracks.
      </p>

      <div className="mb-6">
        <TrackTabs tracks={tracks} activeTrack={filterState.track} />
      </div>

      <div className="mb-8">
        <CatalogFilters tracks={tracks} />
      </div>

      {/* Re-suspend when the filters change so the skeleton shows during
          each new fetch. */}
      <Suspense
        key={JSON.stringify(courseFilters)}
        fallback={<CourseGridSkeleton />}
      >
        <CatalogResults filters={courseFilters} />
      </Suspense>
    </div>
  );
}
