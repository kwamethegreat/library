"use server";

import { redirect } from "next/navigation";

import { clientEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Supported OAuth providers. Extend as providers are configured in Supabase.
 */
export type OAuthProvider = "google" | "github";

/**
 * Initiates an OAuth sign-in. Guarded by the OAUTH_ENABLED feature flag: if
 * OAuth is off, this is a no-op that returns an error, so the flow can't be
 * triggered even if a button somehow renders. When on, it asks Supabase for
 * the provider's authorization URL and redirects the user there.
 */
export async function signInWithOAuthAction(
  provider: OAuthProvider,
): Promise<{ error: string } | void> {
  if (!clientEnv.NEXT_PUBLIC_OAUTH_ENABLED) {
    return { error: "OAuth sign-in is not enabled." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      // Reuse the existing confirm route as the OAuth callback landing.
      redirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/confirm`,
    },
  });

  if (error || !data?.url) {
    return { error: "Could not start OAuth sign-in. Please try again." };
  }

  // Supabase returns the provider's authorization URL; send the user there.
  redirect(data.url);
}