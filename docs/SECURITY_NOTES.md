########## 06-29-2026 Update

Admin access: Admins receive no client-side RLS escalation. Privileged reads go through requireAdmin() (lib/auth/requireAdmin.ts), which verifies the caller's admin role via the RLS-respecting server client, then escalates to the service-role client server-side. Never add an RLS policy granting admins broad access based on a client-evaluated role.

########## 07-03-2026 Update

# Security Notes

Reference for the authentication and authorization system. Captures the design,
the flows, the guard logic, and the non-obvious edge cases and decisions made
while building Phase 3. Read this before changing anything in `src/lib/auth/`,
`src/lib/supabase/`, `src/proxy.ts`, or the `(auth)` routes.

---

## 1. Defense-in-depth model

Access control has three layers. Each has a distinct job; do not rely on any one
alone.

1. **Proxy (`src/proxy.ts` + `src/lib/supabase/middleware.ts`)** — first-touch UX
   layer. Refreshes the session cookie (`updateSession`) and redirects
   unauthenticated requests away from protected path prefixes
   (`PROTECTED_PREFIXES = ["/dashboard", "/admin"]`) to
   `/login?redirectTo=<path>`. This is a convenience/redirect layer, **not** real
   enforcement — it can be bypassed and must never be the only gate.
2. **Page / action guards (`src/lib/auth/guards.ts`)** — the real application-level
   enforcement. Every protected Server Component, Server Action, and Route Handler
   calls `requireUser()` or `requireAdmin()` at the top. These re-check auth
   server-side regardless of what the proxy did.
3. **Row-Level Security (Postgres)** — the last line. Even if application code has
   a bug, RLS policies restrict what data a given role can read/write. This is the
   only layer that protects the data itself.

Rule of thumb: **the proxy is UX, the guards are enforcement, RLS is the
guarantee.** A protected route needs a guard even though the proxy also covers it.

---

## 2. Supabase clients

Three clients, three trust levels. Using the wrong one is the most dangerous
mistake in the codebase.

- **`src/lib/supabase/server.ts` — `createClient()`** — cookie-based, uses the
  ANON/publishable key, **respects RLS**. This is the default for all
  user-facing server code. Reads/writes happen as the logged-in user, subject to
  RLS. Carries the `<Database>` generic for typed queries.
- **`src/lib/supabase/admin.ts` — `createAdminClient()`** — uses the
  SERVICE-ROLE key, **BYPASSES RLS**. Server-only. Use ONLY for trusted system
  operations that legitimately act outside any user's permissions (e.g. webhook
  handlers). NEVER import into a Client Component. Validated via
  `getSupabaseServiceEnv()` (only the service-role key, not the full server
  schema — see §9).
- **`src/lib/supabase/client.ts`** — browser client, anon key, RLS-respecting.
  For Client Components.

**Auth check discipline:** always use `getUser()` (validates the token with the
auth server), never `getSession()` (only reads the cookie and can be spoofed).
`getCurrentUser()` in `user.ts` follows this.

---

## 3. Auth flows

### Signup + email confirmation
1. `/signup` → client validates with `signupSchema` → `signupAction` re-validates
   → `supabase.auth.signUp()` with `emailRedirectTo` pointing at
   `${APP_URL}/auth/confirm`.
2. The `handle_new_user()` DB trigger (SECURITY DEFINER) auto-creates the
   `profiles` and `user_preferences` rows on the `auth.users` insert, reading
   `display_name` from `raw_user_meta_data`.
3. User lands on `/signup/check-email` (no session yet — confirmation required).
4. Confirmation email uses a CUSTOM template (`supabase/templates/confirmation.html`,
   wired via `[auth.email.template.confirmation]` in `config.toml`) whose link is
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`. This is
   the SSR/token_hash flow — the DEFAULT `{{ .ConfirmationURL }}` uses a
   client-fragment flow incompatible with our cookie-based SSR setup, so the
   template change is REQUIRED, not optional.
5. `/auth/confirm` route handler (`(auth)/auth/confirm/route.ts`) reads
   `token_hash` + `type`, calls `verifyOtp`, which confirms the account and sets
   the session cookie. Then routes onward (see onboarding below).

### Login
- `/login` → `loginAction` → `signInWithPassword`. Distinguishes
  `error.code === "email_not_confirmed"` (specific, helpful message) from all
  other failures (GENERIC "Invalid email or password" — see anti-enumeration §5).
- On success, redirects to a validated internal `redirectTo` (the proxy sets this)
  or `/dashboard`.

### Logout
- `logoutAction` (`src/lib/auth/actions.ts`) → `signOut()` (clears cookies
  server-side) → redirect `/`. Wired into `Navigation` via a server-component form
  in `LogoutButton`.

### Password reset
- `/reset-password` → `requestPasswordResetAction` → `resetPasswordForEmail` with
  `redirectTo` = `${APP_URL}/reset-password/update`.
- Recovery email uses `supabase/templates/recovery.html`
  (`[auth.email.template.recovery]`), link:
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password/update`.
- The SAME `/auth/confirm` route handles `type=recovery` — it verifies the token
  (establishing a recovery session) and redirects to the explicit `next`.
- `/reset-password/update` checks for the recovery session (`getCurrentUser`),
  shows an "invalid/expired link" message if absent, else the new-password form →
  `updatePasswordAction` → `updateUser({ password })`.

### Onboarding routing
- After confirmation, `/auth/confirm` calls `getPostAuthDestination()`
  (`src/lib/auth/onboarding.ts`): no `onboarding_lane` → `/onboarding`, else
  `/dashboard`. Recovery flows pass an explicit `next` which is honored instead.
- `/onboarding` (top-level protected route, guarded by `requireUser`) lets the
  user pick a lane (`student` | `professional` | `enterprise`), persisted to
  `profiles.onboarding_lane` via `setOnboardingLaneAction` (RLS client — a user
  updating their own profile is permitted; `onboarding_lane` is not a privileged
  column). Lanes are enforced app-layer (Zod enum); the DB column is free-text.

---

## 4. Guards (`src/lib/auth/guards.ts`)

- **`requireUser(redirectTo?)`** → returns the `User` when authenticated;
  otherwise `redirect()`s to `/login` (or `/login?redirectTo=<encoded>`).
  Because `redirect()` throws to halt execution, the `return user` line is only
  reached when a user exists — after a redirect, control never continues.
- **`requireAdmin()`** → no profile → `/login?redirectTo=/admin`; non-admin →
  `/dashboard` (soft 403); admin → returns `{ profile, admin: createAdminClient() }`.
  The admin role is verified via the RLS-respecting client FIRST, then we
  deliberately escalate to the service-role client. Admins get NO client-side RLS
  escalation.
- Tier/role helpers in `user.ts`: `getUserTier()` returns `"visitor"` when no
  profile, else the profile tier; `getUserRole()` returns the role or null.

Guard logic is covered by unit tests (`guards.test.ts`, `user.test.ts`, Vitest),
run in CI on every push. Changing a redirect path or the tier mapping without
updating the tests will fail the build.

---

## 5. Anti-enumeration

Auth responses must never reveal whether a given email has an account. Decisions:

- **Signup**: always redirects to `/signup/check-email` regardless of whether the
  email was new or already registered. Supabase deliberately does not error on a
  duplicate email; we do not special-case it.
- **Login**: any failure other than `email_not_confirmed` returns the GENERIC
  "Invalid email or password." Wrong-password and nonexistent-email are
  indistinguishable to the client. (`email_not_confirmed` is safe to be specific
  about — the user already proved they own the email by signing up.)
- **Password reset request**: ALWAYS returns uniform success, even on invalid
  input, a nonexistent email, OR when rate-limited (silent drop). Surfacing a
  rate-limit error here would leak state.
- **Login validation**: `loginSchema` checks password is non-empty ONLY — it does
  NOT enforce the signup password policy, so we neither leak the policy nor reject
  legitimate pre-existing passwords.

---

## 6. Rate limiting (`src/lib/rate-limit.ts`)

- Backed by **Upstash Redis** (`@upstash/ratelimit` + `@upstash/redis`),
  distributed and persistent across serverless instances and deploys. Validated
  via `getRateLimitEnv()` (only the two `UPSTASH_*` vars — see §9). Sliding-window
  algorithm, lazy client/limiter creation, `analytics: false`.
- `checkAuthRateLimit({ action, account, ipLimit, ipWindowMs, accountLimit,
  accountWindowMs })` applies BOTH a per-IP and a per-account limit; fails if
  either trips. Keys: `<action>:ip:<ip>` and `<action>:account:<email>`.
- Current limits:
  - Login: 10 / 15 min per IP, 5 / 15 min per account.
  - Signup: 5 / hour per IP, 3 / hour per account.
  - Reset: 5 / hour per IP, 3 / hour per account.
- On trip, callers return a single GENERIC "Too many attempts" message (never
  reveal which limit tripped — anti-enumeration). Reset silently drops instead.
- Backstop: Supabase's own `[auth.rate_limit]` in `config.toml` provides a
  distributed limit at the auth-service layer independent of the app.
- IP is read from `x-forwarded-for` / `x-real-ip`; locally these are absent so IP
  falls back to `"unknown"` (all local requests share one bucket — fine for tests,
  and per-account limits still work).

---

## 7. Self-healing profiles (`src/lib/auth/ensure-profile.ts`)

Every auth user should have a `profiles` row (created by the `handle_new_user`
trigger). For the rare cases where one is missing (user created before the
trigger existed, trigger failure, manual deletion, certain OAuth edges),
`getUserProfile()` lazily creates it on the first authenticated read.

**Mechanism:** it calls the `ensure_profile_for_current_user()` Postgres function
(SECURITY DEFINER, `search_path = ''`) via the NORMAL RLS client. The function
runs as its owner, so it can insert regardless of RLS/grants, WITHOUT needing the
service-role key. It inserts only `auth.uid()`'s own row with default role/tier
(`on conflict do nothing`, idempotent), so exposing `execute` to `authenticated`
is safe — it can never forge another user's profile or escalate.

**Why not the admin/service-role client?** See §8 — the service-role key does not
reliably resolve to the `service_role` Postgres role on the local stack, which
made the admin-client approach fail with `permission denied`. The SECURITY DEFINER
RPC mirrors the proven `handle_new_user` trigger and avoids the service-role key
entirely.

---

## 8. Service-role key: local-stack quirk (IMPORTANT)

Supabase's new API keys (`sb_publishable_...` = anon, `sb_secret_...` =
service_role) replace the legacy JWT keys (`eyJ...`). On the LOCAL CLI stack, the
new `sb_secret_` key does NOT reliably resolve to the `service_role` Postgres role
for PostgREST requests — the API gateway is supposed to substitute an internal
`service_role` JWT for the `sb_secret_` key, and that substitution has been buggy
on current CLI versions. Symptom: an admin client built with `sb_secret_` gets
`permission denied` / apikey errors and does NOT bypass RLS, even though the key
and grants are correct.

Consequences / how we handle it:
- **Profile self-heal** avoids the admin client entirely (uses the SECURITY
  DEFINER RPC — §7).
- **`admin.ts` still exists** for future genuine service-role needs (Stripe/Mux
  webhooks, etc.). Before relying on it in those paths, resolve this: either use
  the legacy `service_role` JWT (`eyJ...`, from `supabase status -o env`) locally,
  or confirm a CLI version where the `sb_secret_` substitution works. In
  production (hosted Supabase) the `sb_secret_` key resolves correctly.
- If you swap to the legacy JWT: it must be the FULL three-part `eyJ....eyJ....sig`
  token (a truncated value gives "Expected 3 parts in JWT; got 2").

Both key formats work simultaneously during the migration period (through end of
2026), so choosing the legacy JWT for the admin client locally is supported.

---

## 9. Environment validation (`src/lib/env.ts`)

`env.ts` validates on import. To avoid an all-or-nothing failure (where a missing
Stripe/Mux/etc. key breaks unrelated auth code), server secrets are split into
narrow, independently-validated getters:

- **`clientEnv`** — `NEXT_PUBLIC_*`, validated eagerly on import (needed in the
  browser). Includes `NEXT_PUBLIC_OAUTH_ENABLED` (boolean, default false).
- **`getServerEnv()`** — the FULL server schema (Stripe, Mux, Resend, Sentry,
  service-role). Call only from code that needs those integrations.
- **`getSupabaseServiceEnv()`** — ONLY the service-role key. Used by the admin
  client so it works before the other integrations are configured.
- **`getRateLimitEnv()`** — ONLY the Upstash vars. Used by the rate limiter.

Lesson: when adding a new integration (Stripe, Mux, ...), give it its own narrow
getter rather than piling onto `getServerEnv()`, so a missing key in one
subsystem never breaks another.

Test/CI env: `.env.test` (committed — placeholder values only, no secrets) and the
CI workflow's `env:` block supply the `NEXT_PUBLIC_*` values so import-time
validation passes during test/build.

---

## 10. Redirect safety

All URL-driven redirects are guarded against open-redirect abuse: only internal
paths (`startsWith("/")`) are honored; anything else falls back to a safe default.
Applies to the login `redirectTo`, the `/auth/confirm` `next` param, and the
password-reset flow. An attacker cannot craft `?redirectTo=https://evil.com` to
bounce a user off-site post-auth.

---

## 11. OAuth (scaffolded, disabled)

OAuth is scaffolded but OFF by default (`NEXT_PUBLIC_OAUTH_ENABLED=false`).
`signInWithOAuthAction` (`src/lib/auth/oauth.ts`) and `OAuthButtons` exist but the
buttons don't render and the action no-ops while the flag is false. Defense in
depth: both the UI (flag gates rendering) and the action (flag gates execution)
check the flag. When enabling later: configure the provider in Supabase, flip the
flag, and add a `code`-exchange branch to `/auth/confirm` (OAuth returns a PKCE
`code`, not a `token_hash`).

---

## 12. RLS summary (from Phase 2)

- All 11 tables have RLS enabled, deny-by-default. Every policy has a matching
  table-level GRANT (a policy without a grant yields `42501` before RLS even runs).
- `profiles`: users read/update their OWN row; a trigger
  (`protect_profile_privileged_columns`) blocks self-changes to `role`/`tier`.
- Public catalog tables (tracks/courses/modules/lessons) are readable only
  `WHERE published`.
- Two-layer paywall: the catalog shows an item EXISTS (published); consuming it is
  gated server-side by `access_level` + entitlement in the TS layer, with paid
  asset bodies served only via the service-role path.
- `service_role` BYPASSES RLS but NOT table grants (relevant to §7/§8).

---

## 13. Open items / TODO before production

- **`/auth/auth-error` page** — the `/auth/confirm` route redirects here on a
  bad/expired token, but the page isn't built yet (currently 404s). Add a small
  "invalid or expired link" page.
- **Service-role key in prod** — resolve the §8 quirk for any admin-client code
  path (webhooks) before launch. Verify the hosted `sb_secret_` key bypasses RLS
  as expected.
- **Production redirect URLs** — `config.toml` `additional_redirect_urls` and the
  email templates use localhost. Add the production domain (and set the hosted
  project's email templates to the `token_hash` flow) at deploy.
- **Rate-limit env in prod** — set `UPSTASH_REDIS_REST_URL` / `_TOKEN` in the
  deployment platform.
- **Branch protection** — `main` requires the CI `verify` status check to pass.
  Consider also requiring PRs for security-sensitive changes.

---

_Last updated: end of Phase 3 (auth). Keep this current as auth changes._