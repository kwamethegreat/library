import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { canAccessPaidContent } from "@/lib/entitlement/rules";
import type {
  SubscriptionStatus,
  ViewerEntitlement,
} from "@/lib/entitlement/types";
import { VISITOR_ENTITLEMENT } from "@/lib/entitlement/types";
import { createClient } from "@/lib/supabase/server";
import type { UserTier } from "@/types/access";

/**
 * Compute the current viewer's entitlement, SERVER-SIDE. (item 127)
 *
 * `server-only` is imported deliberately: entitlement must never be computed in
 * the browser, where the answer could be tampered with. Client components that
 * need it read the server-computed value (see the /api/entitlements/me route,
 * item 135) rather than deriving it themselves.
 *
 * SOURCE OF TRUTH -- why we don't just read profiles.tier:
 *   profiles.tier is a denormalized convenience column, updated by the Stripe
 *   webhook. The subscriptions table is the authoritative mirror of Stripe. If
 *   a webhook fails or arrives late, tier can be stale -- and a stale "paid"
 *   tier would hand out paid content for free. So paid access is derived from
 *   subscriptions.status via canAccessPaidContent(), and tier is only used for
 *   the enterprise distinction (which isn't subscription-driven for MVP).
 *
 * RLS: this uses the ordinary (RLS-respecting) server client. The subscriptions
 * policy allows a user to read ONLY their own row, so this query cannot leak
 * another user's subscription even if the user_id filter were wrong.
 */
export async function getViewerEntitlement(): Promise<ViewerEntitlement> {
  const user = await getCurrentUser();

  if (!user) {
    return VISITOR_ENTITLEMENT;
  }

  const supabase = await createClient();

  // A user may have more than one subscription row over time (resubscribe,
  // plan change). Take the most recently updated one as current.
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    // FAIL CLOSED: if we can't determine entitlement, deny paid access rather
    // than assuming it. A logged-in user with an unreadable subscription is
    // treated as a free user, not a paying one.
    console.error("Failed to read subscription for entitlement:", error.message);
    return {
      isAuthenticated: true,
      tier: "free",
      hasActiveAccess: false,
      status: null,
    };
  }

  const status = (data?.status as SubscriptionStatus | undefined) ?? null;
  const hasActiveAccess = canAccessPaidContent(status);

  // Tier reflects the entitlement we just computed, so callers can't get a
  // tier of "paid" alongside hasActiveAccess === false.
  const tier: UserTier = hasActiveAccess ? "paid" : "free";

  return {
    isAuthenticated: true,
    tier,
    hasActiveAccess,
    status,
  };
}
