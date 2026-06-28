import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { clientEnv } from "@/lib/env";

/**
 * Refreshes the Supabase auth session on each request and syncs the updated
 * session cookie onto the response. Server Components can't write cookies, so
 * this middleware is what actually persists refreshed tokens.
 *
 * Route-guarding for /dashboard and /admin is added later (step 77).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Do not run any code between createServerClient and getUser().
  // getUser() is what triggers the token refresh; inserting logic here can
  // cause intermittent, hard-to-debug session loss.
  await supabase.auth.getUser();

  return supabaseResponse;
}