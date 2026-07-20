import type { UserTier } from "@/types/access";

/**
 * Stripe subscription statuses, mirroring the CHECK constraint on
 * public.subscriptions.status (which itself mirrors Stripe's status enum).
 *
 * The generated DB types widen this column to `string`; this is the narrowed
 * union we use in entitlement logic so switches can be exhaustive.
 */
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused";

/**
 * The server-computed answer to "what may this viewer access?".
 *
 * Produced by getViewerEntitlement() and consumed by the pure access helpers.
 * Deliberately small: it carries the FACTS about the viewer, not decisions
 * about specific content -- those are made by canAccessLesson/canAccessAsset
 * (items 129/130) so the decision logic stays pure and testable.
 */
export interface ViewerEntitlement {
  /** Whether a session exists at all. */
  isAuthenticated: boolean;
  /**
   * The viewer's tier. "visitor" when logged out. For logged-in users this is
   * derived from their subscription state, NOT read blindly from profiles.tier
   * -- see getViewerEntitlement for why.
   */
  tier: UserTier;
  /**
   * THE gate for paid content: true only when a subscription is in a
   * paying/valid state (active or trialing). Everything paid keys off this.
   */
  hasActiveAccess: boolean;
  /**
   * The raw subscription status, or null when the viewer has no subscription
   * row (logged-out, or a free user who never subscribed). Exposed for
   * diagnostics and messaging (e.g. "your payment failed"), never for gating --
   * gate on hasActiveAccess.
   */
  status: SubscriptionStatus | null;
}

/** The entitlement of an anonymous visitor: no session, no access. */
export const VISITOR_ENTITLEMENT: ViewerEntitlement = {
  isAuthenticated: false,
  tier: "visitor",
  hasActiveAccess: false,
  status: null,
};
