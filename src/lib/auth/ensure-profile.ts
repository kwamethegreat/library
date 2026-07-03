import "server-only";

import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

type Profile = Tables<"profiles">;

/**
 * Lazily creates a `profiles` row for an authenticated user that is missing one
 * (self-healing for the rare cases where handle_new_user didn't run).
 *
 * Uses a SECURITY DEFINER database function (ensure_profile_for_current_user)
 * invoked through the NORMAL RLS client -- the same approach as the signup
 * trigger. The function runs as its owner, so it can insert the row regardless
 * of RLS/grants, WITHOUT needing the service-role key. It creates only the
 * CURRENT user's own row (keyed by auth.uid()), so exposing it to authenticated
 * users is safe.
 *
 * Idempotent (the function does ON CONFLICT DO NOTHING). Returns the profile.
 */
export async function ensureProfile(user: User): Promise<Profile> {
  const supabase = await createClient();

  const { error: rpcError } = await supabase.rpc(
    "ensure_profile_for_current_user",
  );

  if (rpcError) {
    throw new Error(`Failed to create profile: ${rpcError.message}`);
  }

  // Re-fetch through the normal client; the user can read their own profile.
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (fetchError) {
    throw new Error(
      `Failed to load profile after create: ${fetchError.message}`,
    );
  }

  return profile;
}
