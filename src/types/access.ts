/**
 * Access level required by a piece of content (course, lesson, resource).
 * Content is never "visitor" - the lowest it can require is "free".
 */
export type AccessLevel = "free" | "paid" | "enterprise";

/**
 * Tier of a user/visitor. Adds "visitor" for anonymous (logged-out) users,
 * who have no account. Compared against a content item's AccessLevel to
 * decide entitlement.
 */
export type UserTier = "visitor" | "free" | "paid" | "enterprise";

/**
 * Permission role, orthogonal to tier. Governs admin access, not content access.
 * A user can be any combination of UserTier and UserRole.
 */
export type UserRole = "user" | "admin";

/**
 * The gated ACTIONS a viewer can attempt. When one is blocked, the paywall
 * fires with the intent that triggered it, so the modal can explain exactly
 * what was locked rather than showing generic "upgrade" copy.
 *
 * This is the vocabulary the rest of the paywall is built on:
 *   - the gated UI reports which intent the viewer attempted,
 *   - the paywall modal explains that specific blocked action,
 *   - analytics can attribute conversions to the intent that drove them.
 *
 * Intents describe an ACTION, not a permission. Whether the action is actually
 * allowed is decided by the entitlement helpers -- never by the intent alone,
 * and never on the client.
 */
export type PaywallIntent =
  /** Copy a code snippet from the workspace. */
  | "copy_code"
  /** Download a project scaffold / code asset file. */
  | "download_scaffold"
  /** Run the validation-lab test suite for a challenge. */
  | "run_tests"
  /** Open a lesson whose access_level is above the viewer's tier. */
  | "open_paid_lesson"
  /** View a locked code asset's contents in the Code Vault. */
  | "view_code_asset";

/**
 * Human-facing copy for each intent, used by the paywall modal (item 132) to
 * name the blocked action. Kept beside the union so adding an intent forces you
 * to write its copy -- the Record is exhaustive, so a new member without an
 * entry is a compile error.
 *
 * `action` completes the sentence "Sign up to ..." / "Upgrade to ...".
 */
export const PAYWALL_INTENT_COPY: Record<
  PaywallIntent,
  { action: string; explanation: string }
> = {
  copy_code: {
    action: "copy this code",
    explanation:
      "Copying code from paid challenges requires an active subscription.",
  },
  download_scaffold: {
    action: "download this scaffold",
    explanation:
      "Project scaffolds are part of the Code Vault, included with a subscription.",
  },
  run_tests: {
    action: "run the validation lab",
    explanation:
      "Validation labs verify your build against the expected behaviour.",
  },
  open_paid_lesson: {
    action: "open this lesson",
    explanation: "This lesson is part of a paid challenge.",
  },
  view_code_asset: {
    action: "view this code asset",
    explanation:
      "Code Vault assets are included with a subscription and yours to reuse.",
  },
};
