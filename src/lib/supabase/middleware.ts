import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { clientEnv } from "@/lib/env";

// Route prefixes that require an authenticated user.
const PROTECTED_PREFIXES = ["/dashboard", "/admin"];

/**
 * Refreshes the Supabase auth session on each request AND guards protected
 * routes: unauthenticated requests to /dashboard or /admin are redirected to
 * /login (preserving the intended destination).
 *
 * This is a first-layer UX guard. Page-level requireUser()/requireAdmin() and
 * RLS are the real enforcement. Admin ROLE authorization is checked at the
 * page, not here (it requires a DB query we don't want on every edge request).
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
  // getUser() triggers the token refresh; inserting logic here can cause
  // intermittent, hard-to-debug session loss.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route guarding: send unauthenticated users on protected routes to /login,
  // preserving where they were headed via ?redirectTo=.
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: return supabaseResponse so refreshed session cookies persist.
  return supabaseResponse;
}