import { z } from "zod";

/**
 * Typed environment loader.
 *
 * clientEnv  — NEXT_PUBLIC_* vars, safe in the browser (inlined at build time).
 *              Validated eagerly when this module is imported.
 * getServerEnv() — secrets, server-only. Validated lazily on first call and
 *              guarded so it can never run in a Client Component / browser bundle.
 * getRateLimitEnv() — the Upstash Redis vars, validated independently of the
 *              full server schema so the rate limiter works before the other
 *              integrations (Stripe, Mux, …) have their keys set.
 *
 * IMPORTANT: validation runs on import. Until .env.local holds real values, do
 * NOT import this at global startup (e.g. instrumentation.ts) or the app will
 * refuse to boot. Import clientEnv / getServerEnv() inside the specific modules
 * that need them as you build each integration.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1),
  NEXT_PUBLIC_POSTHOG_HOST: z.url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1),
  NEXT_PUBLIC_OAUTH_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  MUX_TOKEN_ID: z.string().min(1),
  MUX_TOKEN_SECRET: z.string().min(1),
  MUX_SIGNING_KEY_ID: z.string().min(1),
  MUX_SIGNING_KEY_PRIVATE: z.string().min(1),
  MUX_WEBHOOK_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.string().min(1),
  SENTRY_AUTH_TOKEN: z.string().min(1),
  SENTRY_ORG: z.string().min(1),
  SENTRY_PROJECT: z.string().min(1),
});

const rateLimitSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map(
      (issue) =>
        `  - ${issue.path.map(String).join(".") || "(root)"}: ${issue.message}`,
    )
    .join("\n");
}

// --- Client env: eager, safe on both server and client ---
// Each NEXT_PUBLIC_ var is read explicitly (no destructuring) so Next.js can
// statically inline it.
const clientParsed = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_OAUTH_ENABLED: process.env.NEXT_PUBLIC_OAUTH_ENABLED,
});
if (!clientParsed.success) {
  throw new Error(
    `Invalid client environment variables:\n${formatIssues(clientParsed.error)}\n` +
      `Check your .env.local against .env.example.`,
  );
}
export const clientEnv = clientParsed.data;

// --- Server env: lazy + guarded, server-only ---
let cachedServerEnv: z.infer<typeof serverSchema> | undefined;
export function getServerEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== "undefined") {
    throw new Error(
      "getServerEnv() was called in client code. Server-only env vars are not available in the browser.",
    );
  }
  if (!cachedServerEnv) {
    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `Invalid server environment variables:\n${formatIssues(parsed.error)}\n` +
          `Check your .env.local against .env.example.`,
      );
    }
    cachedServerEnv = parsed.data;
  }
  return cachedServerEnv;
}

// --- Rate-limit env: lazy + guarded, validated independently ---
// Kept separate from serverSchema so the rate limiter can run before the other
// integrations have their secrets set.
let cachedRateLimitEnv: z.infer<typeof rateLimitSchema> | undefined;
export function getRateLimitEnv(): z.infer<typeof rateLimitSchema> {
  if (typeof window !== "undefined") {
    throw new Error(
      "getRateLimitEnv() was called in client code. Server-only env vars are not available in the browser.",
    );
  }
  if (!cachedRateLimitEnv) {
    const parsed = rateLimitSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `Invalid rate-limit environment variables:\n${formatIssues(parsed.error)}\n` +
          `Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local.`,
      );
    }
    cachedRateLimitEnv = parsed.data;
  }
  return cachedRateLimitEnv;
}
