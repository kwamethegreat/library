"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

/**
 * Server action: validates input (again), then signs in with password.
 * Returns a friendly error on failure; on success, redirects to `redirectTo`
 * (validated to an internal path) or /dashboard.
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