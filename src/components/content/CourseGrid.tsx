import { CourseCard } from "@/components/content/CourseCard";
import type { CourseCardData } from "@/types/content";

interface CourseGridProps {
  courses: CourseCardData[];
  /** Message shown when there are no courses. */
  emptyMessage?: string;
}

/**
 * Renders CourseCards in a responsive grid, or an empty state when there are
 * none. This is a Server Component (no interactivity). Loading is handled
 * separately via <Suspense fallback={<CourseGridSkeleton />}> around the async
 * component that fetches + renders this -- see notes.
 */
export function CourseGrid({ courses, emptyMessage }: CourseGridProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center">
        <p className="text-sm font-medium text-foreground">
          {emptyMessage ?? "No courses found"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters, or check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

/**
 * Loading placeholder matching the grid layout and card shape. Use as the
 * Suspense fallback while courses are being fetched.
 */
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`course-skeleton-${index}`}
          className="animate-pulse rounded-xl border border-border bg-surface p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-5 w-14 rounded-full bg-muted" />
          </div>
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="mt-4 flex gap-3">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
