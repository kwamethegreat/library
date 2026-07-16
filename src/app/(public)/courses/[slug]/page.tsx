import { Code2 } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseCtaBlock } from "@/components/content/CourseCtaBlock";
import { CourseModuleList } from "@/components/content/CourseModuleList";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { LockedBadge } from "@/components/ui/LockedBadge";
import { getCurrentUser, getUserTier } from "@/lib/auth";
import { getCourseWithHierarchy } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { CourseLevel, ValidationLabStatus } from "@/types/content";

const LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Matches the catalog card's lab language so the two views agree. */
const LAB_STATUS: Record<
  ValidationLabStatus,
  { label: string; className: string; dot: string }
> = {
  active: { label: "Lab active", className: "text-success", dot: "bg-success" },
  draft: {
    label: "Lab in draft",
    className: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  archived: {
    label: "Lab archived",
    className: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  none: {
    label: "No validation lab",
    className: "text-muted-foreground",
    dot: "bg-border",
  },
};

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseWithHierarchy(slug);

  if (!course) {
    return { title: "Course not found" };
  }

  return {
    title: course.title,
    description: course.description ?? undefined,
  };
}

/**
 * Public course detail page. Server component -- no client JS.
 *
 * Unpublished or unknown slugs resolve to null from the fetcher (RLS +
 * explicit published filter), so they 404 rather than leaking a draft's
 * existence.
 *
 * Paid lessons and paid code assets appear here as LOCKED metadata: their
 * titles are advertised, their payloads are not fetched. The unlock CTAs are
 * item 112.
 */
export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourseWithHierarchy(slug);

  if (!course) {
    notFound();
  }

  // Auth-aware CTA (item 112). This is NOT an entitlement check -- it only
  // decides which CTA to show. The lesson page (item 120) does the real gate.
  const user = await getCurrentUser();
  const tier = user ? await getUserTier() : null;

  // The first FREE lesson, in curriculum order, powers the preview/start CTA.
  const firstFreeLessonSlug =
    course.modules
      .flatMap((module) => module.lessons)
      .find((lesson) => lesson.access_level === "free")?.slug ?? null;

  const lab = LAB_STATUS[course.validation_lab_status];
  const lessonCount = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );
  const assetCount = course.modules.reduce(
    (total, module) =>
      total +
      module.lessons.reduce(
        (lessonTotal, lesson) => lessonTotal + lesson.codeAssets.length,
        0,
      ),
    0,
  );

  return (
    <>
      {/* Overview */}
      <Section spacing="spacious">
        <Container size="narrow">
          {course.system_moat_identifier ? (
            <p className="mb-3 font-mono text-xs tracking-tight text-muted-foreground">
              {course.system_moat_identifier}
            </p>
          ) : null}

          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {course.title}
          </h1>

          {course.description ? (
            <p className="mt-3 text-muted-foreground">{course.description}</p>
          ) : null}

          {/* Badges: format, level, category, access */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <FormatBadge format={course.format} />
            <Badge variant="outline" className="border-border">
              {LEVEL_LABELS[course.level]}
            </Badge>
            {course.category ? (
              <Badge
                variant="outline"
                className="border-border font-mono text-xs"
              >
                {course.category}
              </Badge>
            ) : null}
            <LockedBadge accessLevel={course.access_level} />
          </div>

          {/* Operational facts: lab status, lesson/asset counts */}
          <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className={cn("flex items-center gap-1.5", lab.className)}>
              <dt className="sr-only">Validation lab</dt>
              <span
                className={cn("h-1.5 w-1.5 rounded-full", lab.dot)}
                aria-hidden="true"
              />
              <dd>{lab.label}</dd>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <dt className="sr-only">Lessons</dt>
              <dd>
                {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
              </dd>
            </div>

            {assetCount > 0 ? (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                <dt className="sr-only">Code assets</dt>
                <dd>
                  {assetCount} code {assetCount === 1 ? "asset" : "assets"}
                </dd>
              </div>
            ) : null}
          </dl>

          {/* Auth-aware CTA (item 112). */}
          <CourseCtaBlock
            courseAccessLevel={course.access_level}
            tier={tier}
            firstFreeLessonSlug={firstFreeLessonSlug}
          />
        </Container>
      </Section>

      {/* Curriculum */}
      <Section>
        <Container size="narrow">
          <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground">
            Curriculum
          </h2>
          <CourseModuleList modules={course.modules} />
        </Container>
      </Section>
    </>
  );
}
