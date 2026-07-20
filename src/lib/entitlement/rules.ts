import type { SubscriptionStatus } from "@/lib/entitlement/types";

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
