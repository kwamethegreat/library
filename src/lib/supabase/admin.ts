import { createClient } from "@supabase/supabase-js";

import { getServerEnv } from "@/lib/env";

/**
 * ADMIN Supabase client — uses the SERVICE ROLE key and BYPASSES Row-Level
 * Security. Server-only. Use ONLY for trusted operations that legitimately
 * need to act outside any user's permissions (e.g. webhook handlers updating
 * another user's record). NEVER import this into a Client Component, and never
 * use it as a substitute for the cookie-based server client in server.ts.
 */
export function createAdminClient() {
  const env = getServerEnv();

  return createClient(
    // Public URL is fine here; the service-role key is the privileged part.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}