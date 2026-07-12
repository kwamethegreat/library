import Link from "next/link";

import { CourseCard } from "@/components/content/CourseCard";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { buttonVariants } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/db";
import { CTA } from "@/lib/navigation/cta";

/** How many courses to preview on the homepage. */
const PREVIEW_COUNT = 3;

/**
 * A live preview of the curriculum, pulled from the DB rather than hardcoded --
 * the homepage stays honest as content is added. Async server component: it
 * awaits its own data, so the page can stream it inside <Suspense>.
 *
 * RLS + the fetcher's explicit `published` filter guarantee no drafts leak here.
 */
export async function CourseRoadmapPreview() {
  const { courses, total } = await getPublishedCourses(
    {},
    { page: 1, pageSize: PREVIEW_COUNT },
  );

  // Nothing published yet -- render nothing rather than an empty shell.
  if (courses.length === 0) {
    return null;
  }

  return (
    <Section>
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              The roadmap
            </h2>
            <p className="mt-2 text-muted-foreground">
              Progressive challenges across every track. Start anywhere.
            </p>
          </div>
          <Link
            href={CTA.browseCurriculum.href}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {CTA.browseCurriculum.label}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {total > courses.length ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Showing {courses.length} of {total} published challenges.
          </p>
        ) : null}
      </Container>
    </Section>
  );
}

/** Suspense fallback matching the preview grid. */
export function CourseRoadmapPreviewSkeleton() {
  return (
    <Section>
      <Container>
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PREVIEW_COUNT }).map((_, index) => (
            <div
              key={`roadmap-skeleton-${index}`}
              className="h-36 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
