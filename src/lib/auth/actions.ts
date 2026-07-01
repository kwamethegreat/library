"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server action: signs the user out (clears the session cookies via the SSR
 * client) and redirects to the homepage. Wired into a form in LogoutButton.
 */
export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}