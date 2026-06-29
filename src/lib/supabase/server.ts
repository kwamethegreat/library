import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { clientEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Server Supabase client - uses the ANON key + the user's session cookies, so
 * it acts AS the logged-in user and RLS applies. Use this for almost all
 * server-side reads/writes (Server Components, Server Actions, Route Handlers).
 * Initialized per-request (never at module scope) to avoid session leakage.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component (can't write cookies here).
            // The proxy (step 2.5) refreshes/persists the session instead.
          }
        },
      },
    },
  );
}