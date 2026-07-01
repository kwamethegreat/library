import { getUserProfile } from "@/lib/auth/user";

/**
 * Where a freshly-authenticated user should land:
 * - no profile yet (edge case) or no onboarding_lane -> /onboarding
 * - lane already chosen -> /dashboard
 *
 * Centralizes the "have they onboarded?" decision so the confirm route and any
 * future guards use the same rule.
 */
export async function getPostAuthDestination(): Promise<string> {
  const profile = await getUserProfile();

  if (!profile || !profile.onboarding_lane) {
    return "/onboarding";
  }

  return "/dashboard";
}