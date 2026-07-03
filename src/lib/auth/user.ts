import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";
import type { UserRole, UserTier } from "@/types/access";

import { ensureProfile } from "./ensure-profile";

export type Profile = Tables<"profiles">;

/**
 * The authenticated Supabase auth user, or null if not signed in.
 * Uses getUser() (validates the token with the auth server) -- never
 * getSession(), which only reads the cookie and can be spoofed.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * The current user's profile row (role, tier, display_name, ...), or null if
 * not signed in. RLS allows a user to read their own profile, so the read
 * works through the normal server client.
 *
 * Self-healing: if the user is authenticated but has no profile row (a rare
 * edge -- see ensureProfile), we lazily create one with safe defaults and
 * return it, so downstream code can always rely on a profile existing for a
 * signed-in user.
 */
export async function getUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  // Authenticated but no profile -> lazily create one, then use it.
  if (!profile) {
    return ensureProfile(user);
  }

  return profile;
}

/**
 * The current user's tier, used for entitlement decisions.
 * Returns "visitor" when not signed in (no account at all), otherwise the
 * profile's tier ("free" | "paid" | "enterprise").
 */
export async function getUserTier(): Promise<UserTier> {
  const profile = await getUserProfile();
  if (!profile) return "visitor";
  return profile.tier as UserTier;
}

/**
 * The current user's role ("user" | "admin"), or null if not signed in.
 * Role governs admin access; it is orthogonal to tier.
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile();
  if (!profile) return null;
  return profile.role as UserRole;
}
