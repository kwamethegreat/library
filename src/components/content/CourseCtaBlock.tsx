import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getCourseCta, lessonHref } from "@/lib/navigation/cta";
import { cn } from "@/lib/utils";
import type { UserTier } from "@/types";
import type { AccessLevel } from "@/types/access";

interface CourseCtaBlockProps {
  courseAccessLevel: AccessLevel;
  tier: UserTier | null;
  /** Slug of the course's first FREE lesson, if one exists. */
  firstFreeLessonSlug: string | null;
}

/**
 * The primary call-to-action on a course page. Auth-aware but NOT an
 * entitlement check (that's Phase 6): it only chooses which CTA to show based
 * on the viewer's tier and the course's access level. See getCourseCta.
 *
 * Server component -- the session is read on the page and passed down as
 * `tier`, so there's no client JS here.
 */
export function CourseCtaBlock({
  courseAccessLevel,
  tier,
  firstFreeLessonSlug,
}: CourseCtaBlockProps) {
  const cta = getCourseCta({ courseAccessLevel, tier, firstFreeLessonSlug });
  const isLockedCta =
    cta.kind === "signup_to_unlock" || cta.kind === "upgrade_to_unlock";

  // Offer the free preview as a secondary action whenever the primary CTA is a
  // paywall and a free lesson exists to preview.
  const showPreviewLink = isLockedCta && firstFreeLessonSlug !== null;

  return (
    <div className="mt-8 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={cta.href}
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "gap-2")}
        >
          {isLockedCta ? (
            <Lock className="h-4 w-4" aria-hidden="true" />
          ) : null}
          {cta.label}
          {!isLockedCta ? (
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          ) : null}
        </Link>

        {showPreviewLink && firstFreeLessonSlug ? (
          <Link
            href={lessonHref(firstFreeLessonSlug)}
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            Preview free lesson
          </Link>
        ) : null}
      </div>

      {cta.hint ? (
        <p className="text-sm text-muted-foreground">{cta.hint}</p>
      ) : null}
    </div>
  );
}
