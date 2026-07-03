import { Suspense } from "react";

import {
  CourseGrid,
  CourseGridSkeleton,
} from "@/components/content/CourseGrid";
import { getPublishedCourses } from "@/lib/db";

export const metadata = {
  title: "Courses",
};

/**
 * Async server component: fetches courses and renders the grid. Kept separate
 * from the page so the page can wrap it in <Suspense> and show the skeleton
 * while this awaits.
 */
async function CourseList() {
  const courses = await getPublishedCourses();
  return <CourseGrid courses={courses} />;
}

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-foreground">Courses</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Browse the catalog.
      </p>

      <Suspense fallback={<CourseGridSkeleton />}>
        <CourseList />
      </Suspense>
    </div>
  );
}
