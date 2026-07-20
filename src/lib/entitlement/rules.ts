import type {
  SubscriptionStatus,
  ViewerEntitlement,
} from "@/lib/entitlement/types";
import type { AccessLevel } from "@/types/access";

/**
 * Statuses that grant access to paid content.
 *
 * ONLY these two. The reasoning for each excluded status:
 *   past_due           -- payment failed; Stripe still retries, but access is
 *                         revoked until it succeeds (dunning, not grace).
 *   canceled           -- subscription ended.
 *   incomplete         -- initial payment never completed; never had access.
 *   incomplete_expired -- initial payment abandoned.
 *   unpaid             -- retries exhausted.
 *   paused             -- intentionally suspended by the customer/us.
 *
 * If a grace period is ever wanted for past_due, it belongs HERE (one place),
 * behind an explicit decision -- not scattered through call sites.
 */
const ACCESS_GRANTING_STATUSES = new Set<SubscriptionStatus>([
  "active",
  "trialing",
]);

/**
 * Does this subscription status grant access to paid content? (item 128)
 *
 * Pure and total: `null` (no subscription at all) is false, and any unexpected
 * value is false. FAIL CLOSED is the rule -- if we don't recognise a status, we
 * deny rather than assume access. A new Stripe status appearing in the wild
 * must never silently unlock paid content.
 */
export function canAccessPaidContent(
  status: SubscriptionStatus | null | undefined,
): boolean {
  if (!status) {
    return false;
  }
  return ACCESS_GRANTING_STATUSES.has(status);
}

// ---------------------------------------------------------------------------
// Per-content access (items 129 / 130)
// ---------------------------------------------------------------------------

/**
 * The minimum a lesson must expose to be access-checked. Structural on purpose:
 * LessonOutline, LessonView, and a raw lessons row all satisfy it, so these
 * helpers work anywhere without coupling to one view model.
 */
export interface LessonAccessInput {
  access_level: AccessLevel;
  is_public_preview: boolean;
}

/** The minimum a code asset must expose to be access-checked. */
export interface AssetAccessInput {
  access_level: AccessLevel;
}

/**
 * How a lesson should be presented to this viewer:
 *   visible -- full content (free lesson, or the viewer is entitled)
 *   preview -- paid lesson flagged is_public_preview: show the marketing
 *              preview, but NOT the full body/assets
 *   locked  -- paid lesson, no entitlement, no preview: title only
 */
export type LessonAccessState = "visible" | "preview" | "locked";

/**
 * Core rule: can this viewer consume content at the given access level?
 *
 * free       -- everyone, including logged-out visitors.
 * paid       -- requires an active/trialing subscription (hasActiveAccess).
 * enterprise -- requires the enterprise tier. For MVP the enterprise tier is
 *               set manually (lead capture, not self-serve checkout), so it is
 *               NOT granted by an ordinary subscription.
 *
 * Exhaustive over AccessLevel: adding a level is a compile error here, which is
 * deliberate -- a new content tier must make an explicit access decision rather
 * than falling through to allow or deny by accident.
 */
export function canAccessLevel(
  accessLevel: AccessLevel,
  entitlement: ViewerEntitlement,
): boolean {
  switch (accessLevel) {
    case "free":
      return true;
    case "paid":
      return entitlement.hasActiveAccess;
    case "enterprise":
      return entitlement.tier === "enterprise";
    default: {
      // FAIL CLOSED on an unrecognised level.
      const exhaustive: never = accessLevel;
      void exhaustive;
      return false;
    }
  }
}

/**
 * Can this viewer consume the FULL lesson (body, video, assets)? (item 129)
 *
 * NOTE: `is_public_preview` does NOT grant full access. A public preview is a
 * marketing affordance -- the viewer may see the preview, not the whole lesson.
 * Use getLessonAccessState() when you need to distinguish preview from locked.
 */
export function canAccessLesson(
  lesson: LessonAccessInput,
  entitlement: ViewerEntitlement,
): boolean {
  return canAccessLevel(lesson.access_level, entitlement);
}

/**
 * Can this viewer consume the code asset's payload (code_body / download)?
 * (item 129)
 *
 * Assets are gated INDEPENDENTLY of their lesson: a free lesson may carry a
 * paid asset, and that asset stays locked. Never infer asset access from
 * lesson access.
 */
export function canAccessAsset(
  asset: AssetAccessInput,
  entitlement: ViewerEntitlement,
): boolean {
  return canAccessLevel(asset.access_level, entitlement);
}

/**
 * Classify a single lesson as visible / preview / locked.
 */
export function getLessonAccessState(
  lesson: LessonAccessInput,
  entitlement: ViewerEntitlement,
): LessonAccessState {
  if (canAccessLesson(lesson, entitlement)) {
    return "visible";
  }
  return lesson.is_public_preview ? "preview" : "locked";
}

/**
 * Mark every lesson in a list with its access state. (item 130)
 *
 * Generic over the input so the caller keeps its own richer type (e.g.
 * LessonOutlineWithAssets) and simply gains an `accessState` field -- no data
 * is dropped, and no casting is needed at the call site.
 *
 * This CLASSIFIES; it does not redact. Stripping the payload of a locked lesson
 * is the caller's job on the server (items 131+). Never rely on this to keep
 * paid content out of a response.
 */
export function applyLessonAccess<T extends LessonAccessInput>(
  lessons: readonly T[],
  entitlement: ViewerEntitlement,
): (T & { accessState: LessonAccessState })[] {
  return lessons.map((lesson) => ({
    ...lesson,
    accessState: getLessonAccessState(lesson, entitlement),
  }));
}
