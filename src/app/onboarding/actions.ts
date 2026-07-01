"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// The three valid onboarding lanes.
const onboardingLaneSchema = z.object({
  lane: z.enum(["student", "professional", "enterprise"]),
});

/**
 * Persists the user's chosen onboarding lane to their profile, then sends them
 * on to the dashboard. Requires an authenticated user (guarded).
 */
export async function setOnboardingLaneAction(
  input: unknown,
): Promise<{ error: string } | void> {
  const user = await requireUser();

  const parsed = onboardingLaneSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please choose a valid option." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_lane: parsed.data.lane })
    .eq("id", user.id);

  if (error) {
    return { error: "Could not save your choice. Please try again." };
  }

  redirect("/dashboard");
}