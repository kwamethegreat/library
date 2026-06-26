import { createBrowserClient } from "@supabase/ssr";

import { clientEnv } from "@/lib/env";

/**
 * Browser Supabase client — runs in the browser, uses the ANON key only.
 * For Client Components that need Supabase directly (e.g. realtime
 * subscriptions, client-side auth state). Most data fetching should use the
 * server client instead; reach for this only when you genuinely need Supabase
 * in client code.
 */
export function createClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}