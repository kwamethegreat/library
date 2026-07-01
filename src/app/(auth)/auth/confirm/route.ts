import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Email confirmation / recovery callback.
 * The link in the confirmation email points here with token_hash + type.
 * We verify the OTP (which sets the session cookie via the SSR client), then
 * redirect onward. Used for signup confirmation AND password recovery.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Only allow internal (path) redirects to avoid open-redirect abuse.
  const nextParam = searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type,
      token_hash,
    });

    if (!error) {
      redirect(next);
    }
  }

  // Missing params or verification failed.
  redirect("/auth/auth-error");
}