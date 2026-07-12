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
