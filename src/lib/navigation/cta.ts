import type { UserTier } from "@/types";
import type { AccessLevel } from "@/types/access";

/**
 * Single source of truth for the primary marketing CTAs.
 *
 * Copy and targets live here -- NOT inline in the sections -- so that when the
 * real destinations ship, we flip one line instead of hunting through six
 * components. Two of the three targets are INTERIM today:
 *
 *  - freeLesson: the lesson route (`/lessons/[slug]`) doesn't exist until
 *    item 120 (Phase 5). Until then this lands on the catalog filtered to free
 *    courses -- a real page, not a 404.
 *    FLIP AT ITEM 120: point `href` at the Free Lesson 1 slug.
 *
 *  - foundingPass: the pricing page (`/pricing`) doesn't exist until item 140
 *    (Phase 7). Until then this drives to signup, which is live -- and signup
 *    is a legitimate first step of the checkout funnel anyway.
 *    FLIP AT ITEM 140: point `href` at "/pricing".
 *
 * `browseCurriculum` is already final.
 */
export interface Cta {
  label: string;
  href: string;
}

export const CTA = {
  /** Top of the commercial loop: Visitor -> Free Lesson 1. */
  freeLesson: {
    label: "Watch Free Lesson",
    href: "/catalog?access=free", // INTERIM -- see item 120
  },
  /** Visitor -> Catalog. Final. */
  browseCurriculum: {
    label: "Browse Curriculum",
    href: "/catalog",
  },
  /** Visitor -> Paywall/Checkout. */
  foundingPass: {
    label: "Get Founding Builder Pass",
    href: "/signup", // INTERIM -- see item 140
  },
} as const satisfies Record<string, Cta>;

/**
 * Anchor to the homepage pricing teaser. Used by the nav/footer "Pricing" links
 * so they resolve to real content instead of 404ing on the not-yet-built
 * /pricing route.
 *
 * FLIP AT ITEM 140: replace with "/pricing".
 */
export const PRICING_HREF = "/#pricing";

/** DOM ids for the homepage sections that are linked to directly. */
export const HOME_SECTION_IDS = {
  pricing: "pricing",
} as const;

// ---------------------------------------------------------------------------
// Course-page CTA logic (item 112)
// ---------------------------------------------------------------------------

/**
 * The lesson route doesn't exist until item 120. Until then, "start this
 * lesson" links have to land somewhere real. Building the href in one place
 * means item 120 flips a single function, not every call site.
 *
 * FLIP AT ITEM 120: return `/lessons/${lessonSlug}`.
 */
export function lessonHref(lessonSlug: string): string {
  // Interim: the lesson page isn't built, so anchor to the course's free
  // preview intent via the catalog. lessonSlug is threaded through now so the
  // flip at 120 is a one-liner.
  void lessonSlug;
  return CTA.freeLesson.href;
}

/**
 * What the course-detail CTA should do, derived from the viewer's tier and the
 * course's access level. This is INTENTIONALLY simple -- it is not an
 * entitlement check (that's Phase 6). It only decides which CTA to show:
 *
 *   - free course            -> "Start free lesson"       (anyone)
 *   - paid course, guest     -> "Sign up to unlock"       (-> signup)
 *   - paid course, free user -> "Upgrade to unlock"       (-> upgrade/pricing)
 *   - paid course, paid user -> "Start this course"       (treated as unlocked)
 *
 * The last case is optimistic on purpose: real per-course entitlement lands in
 * Phase 6, and the lesson page itself (item 120) will do the authoritative
 * server-side gate. Here we just avoid showing a paying subscriber an "upgrade"
 * button.
 */
export type CourseCtaKind =
  | "start_free"
  | "signup_to_unlock"
  | "upgrade_to_unlock"
  | "start_paid";

export interface CourseCta {
  kind: CourseCtaKind;
  label: string;
  href: string;
  /** Sub-label shown under the button; null when none is needed. */
  hint: string | null;
}

interface CourseCtaInput {
  courseAccessLevel: AccessLevel;
  /** The viewer's tier, or null when signed out. */
  tier: UserTier | null;
  /** Slug of the course's first free lesson, if any. */
  firstFreeLessonSlug: string | null;
}

export function getCourseCta({
  courseAccessLevel,
  tier,
  firstFreeLessonSlug,
}: CourseCtaInput): CourseCta {
  const isFreeCourse = courseAccessLevel === "free";
  const hasPaidAccess = tier === "paid" || tier === "enterprise";

  // Free course, or a subscriber viewing paid content: go straight in.
  if (isFreeCourse || hasPaidAccess) {
    return {
      kind: isFreeCourse ? "start_free" : "start_paid",
      label: isFreeCourse ? "Start free lesson" : "Start this course",
      href: firstFreeLessonSlug
        ? lessonHref(firstFreeLessonSlug)
        : CTA.browseCurriculum.href,
      hint: isFreeCourse ? "No account required" : null,
    };
  }

  // Paid course, signed out (no session at all): signup starts the funnel.
  if (tier === null || tier === "visitor") {
    return {
      kind: "signup_to_unlock",
      label: "Sign up to unlock",
      href: CTA.foundingPass.href,
      hint: firstFreeLessonSlug
        ? "Or preview the free lesson below"
        : "Free account, upgrade anytime",
    };
  }

  // Paid course, signed-in free user: upgrade.
  return {
    kind: "upgrade_to_unlock",
    label: "Upgrade to unlock",
    href: CTA.foundingPass.href, // INTERIM -- see item 140 (-> /pricing or checkout)
    hint: firstFreeLessonSlug ? "Or preview the free lesson below" : null,
  };
}
