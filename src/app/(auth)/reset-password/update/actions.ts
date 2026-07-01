"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { passwordResetConfirmSchema } from "@/lib/validation/auth";

export async function updatePasswordAction(
  input: unknown,
): Promise<{ error: string } | void> {
  const parsed = passwordResetConfirmSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }

  const { password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      error:
        "Could not update your password. Your reset link may have expired — please request a new one.",
    };
  }

  redirect("/dashboard");
}