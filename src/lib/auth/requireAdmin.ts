import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export class AdminAccessError extends Error {
  constructor(
    message: string,
    readonly reason: "unauthenticated" | "forbidden",
  ) {
    super(message);
    this.name = "AdminAccessError";
  }
}

/**
 * Admin access pattern (server-only).
 *
 * Verifies the CURRENT user is an admin using the RLS-respecting server client
 * (a user can read their own profile, including `role`), and ONLY THEN returns
 * the service-role admin client for privileged, RLS-bypassing operations.
 *
 * Admins deliberately get NO client-side RLS escalation. Privilege escalation
 * happens here, server-side, after an explicit role check -- so the powerful
 * service-role access lives in one auditable place, not in SQL policies.
 *
 * Usage (Server Component / Route Handler / Server Action):
 *   const { admin } = await requireAdmin();
 *   const { data } = await admin.from("audit_events").select("*");
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new AdminAccessError("Not authenticated.", "unauthenticated");
  }

  // Read the caller's own profile (RLS allows self-read) to check role.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    throw new AdminAccessError("Admin access required.", "forbidden");
  }

  // Verified admin -> deliberately escalate to the service-role client.
  return { user, admin: createAdminClient() };
}