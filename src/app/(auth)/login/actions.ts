"use server";

import { redirect } from "next/navigation";

import { checkAuthRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

/**
 * Server action: validates input, applies rate limiting, then signs in with
 * password. Returns a friendly error on failure; on success, redirects to
 * `redirectTo` (validated to an internal path) or /dashboard.
 */
export async function loginAction(
  input: unknown,
  redirectTo?: string,
): Promise<{ error: string } | void> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input. Please check the form and try again." };
  }

  const { email, password } = parsed.data;

  // Rate limit: per-IP (10 / 15 min) and per-account (5 / 15 min). Use one
  // generic message regardless of which limit tripped (anti-enumeration).
  const allowed = await checkAuthRateLimit({
    action: "login",
    account: email,
    ipLimit: 10,
    ipWindowMs: 15 * 60 * 1000,
    accountLimit: 5,
    accountWindowMs: 15 * 60 * 1000,
  });
  if (!allowed) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Distinguish "email not confirmed" from "bad credentials" for a helpful
    // message, but do NOT reveal whether the email exists (anti-enumeration).
    if (error.code === "email_not_confirmed") {
      return {
        error:
          "Please confirm your email first. Check your inbox for the confirmation link.",
      };
    }
    return { error: "Invalid email or password." };
  }

  // Only allow internal redirects (open-redirect protection).
  const target =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";
  redirect(target);
}
