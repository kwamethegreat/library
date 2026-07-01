"use server";

import { clientEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { passwordResetRequestSchema } from "@/lib/validation/auth";

export async function requestPasswordResetAction(
  input: unknown,
): Promise<{ success: true }> {
  const parsed = passwordResetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: true };
  }

  const { email } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${clientEnv.NEXT_PUBLIC_APP_URL}/reset-password/update`,
  });

  if (error) {
    console.error("resetPasswordForEmail error:", error.message);
  }

  return { success: true };
}