import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getCurrentUser, getUserProfile } from "@/lib/auth/user";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Requires an authenticated user. Redirects to /login (preserving where they
 * were headed) when not signed in. Returns the user when present.
 *
 * Use at the top of any protected Server Component / Server Action / Route
 * Handler: `const user = await requireUser();`
 */
export async function requireUser(redirectTo?: string): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    const target = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(target);
  }

  return user;
}

/**
 * Requires an authenticated ADMIN. Redirects unauthenticated users to /login;
 * redirects authenticated non-admins to /dashboard (a soft 403 -- they're
 * logged in, just not authorized). On success, returns the user plus the
 * service-role admin client for privileged, RLS-bypassing operations.
 *
 * Admins get NO client-side RLS escalation: the role is verified here via the
 * RLS-respecting client, then we deliberately escalate to the service-role
 * client server-side.
 */
export async function requireAdmin() {
  const profile = await getUserProfile();

  // Not signed in at all -> login.
  if (!profile) {
    redirect("/login?redirectTo=/admin");
  }

  // Signed in but not an admin -> soft 403 (bounce to their dashboard).
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  // Verified admin -> escalate to service-role client.
  return { profile, admin: createAdminClient() };
}