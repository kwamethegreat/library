"use server";

import { redirect } from "next/navigation";

import { clientEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validation/auth";

/**
 * Server action: validates input (again -- never trust the client), then calls
 * Supabase sign-up. With email confirmation required, no session is created;
 * the user must confirm via the emailed link. On success we redirect to the
 * "check your email" interstitial regardless of whether the email was new or
 * already registered (to avoid leaking which emails have accounts).
 */
export async function signupAction(
  input: unknown,
): Promise<{ error: string } | void> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input. Please check the form and try again." };
  }

  const { email, password, displayName } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Explicit, env-derived redirect (the discipline from step 3.2).
      emailRedirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/auth/confirm`,
      // Flows into raw_user_meta_data; handle_new_user reads display_name.
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/signup/check-email");
}