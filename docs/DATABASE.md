# Database

This document describes the database schema, relationships, and Row-Level
Security (RLS) model. The database is Postgres, managed via Supabase. **Schema
is code**: every change is a versioned migration in `supabase/migrations/`,
never a manual change in the dashboard.

## Conventions

- All tables live in the `public` schema.
- Primary keys are `uuid` (`gen_random_uuid()` default), except `profiles` and
  `user_preferences`, whose PK **is** the user id (1:1 with `auth.users`).
- Mutable tables have `created_at` / `updated_at` (`timestamptz`); `updated_at`
  is maintained by the shared `set_updated_at()` trigger function.
- Enumerated values are enforced with `CHECK` constraints (not Postgres enums),
  so the generated TypeScript types see them as `string`. The precise unions
  live in `src/types/access.ts` (`AccessLevel`, `UserTier`, `UserRole`).
- Slugs are URL-safe (`^[a-z0-9]+(-[a-z0-9]+)*$`). Top-level slugs (tracks,
  courses) are globally unique; nested slugs (modules, lessons, code_assets)
  are unique **within their parent** only.

## Entity hierarchy

Content is a tree; user data hangs off `auth.users` via `profiles`.

## Tables

| Table | Purpose | Key columns / notes |
|---|---|---|
| `profiles` | App data extending `auth.users` | PK = auth user id; `role` (user/admin), `tier` (free/paid/enterprise); `role`/`tier` are NOT user-updatable |
| `tracks` | Top-level content grouping | unique `slug`, `published` |
| `courses` | Core sellable content unit | FK `track_id` (RESTRICT); `access_level`, `level`, `published` |
| `modules` | Mid-level grouping in a course | FK `course_id` (CASCADE); slug unique per course |
| `lessons` | Leaf content unit | FK `module_id` (CASCADE); `access_level`, `is_public_preview`, `published` |
| `assets` | Non-code lesson files | FK `lesson_id` (CASCADE); `storage_path` → Supabase Storage; `access_level`. No `published` (inherits lesson visibility) |
| `code_assets` | Code vault entries | FK `lesson_id` (CASCADE); inline `code_body` OR `storage_path` (at least one); `access_level`, `published` |
| `subscriptions` | Local mirror of Stripe state | FK `user_id`; `status` mirrors Stripe; **written only by the webhook (service role)** |
| `user_progress` | Per-user lesson progress | unique `(user_id, lesson_id)`; `status` started/completed |
| `user_preferences` | Per-user settings | PK = `user_id` (strict 1:1); JSONB settings |
| `audit_events` | Append-only action log | `actor_id` SET NULL on delete; polymorphic `target_type`/`target_id` (no FK); never updated/deleted |

## Key relationship decisions

- **`courses → tracks` is `ON DELETE RESTRICT`**: you cannot delete a track that
  still has courses (prevents accidental mass content loss). Everything below a
  course (`modules`, `lessons`, `assets`, `code_assets`) is `CASCADE` — the
  child is meaningless without its parent.
- **`audit_events.actor_id` is `ON DELETE SET NULL`**: the audit trail must
  outlive the actors. Deleting a user preserves the record of what they did.
- **`user_preferences` PK = FK = `user_id`**: enforces exactly one row per user
  at the database level (no surrogate id).

## Row-Level Security (RLS)

**RLS is enabled on all 11 tables; default is deny.** Each table grants back
exactly the access its role needs. Two things bypass RLS by design: the
**service role** (`src/lib/supabase/admin.ts`) and **`SECURITY DEFINER`**
functions (e.g. `handle_new_user`). Every policy has a matching table-level
`GRANT`, or it is unreachable.

| Table | Client access (anon / authenticated) | Writes |
|---|---|---|
| `tracks` / `courses` / `modules` / `lessons` | `SELECT` where `published = true` (catalog visibility, regardless of access_level) | service role only |
| `profiles` | user reads/updates own row; `role`/`tier` blocked by trigger guard | own row (except privileged columns) |
| `subscriptions` | user reads own row only | service role only (Stripe webhook) |
| `user_progress` | user full read/write on own rows | own rows (`with check` on writes) |
| `user_preferences` | user reads/updates own row | own row |
| `assets` / `code_assets` | `SELECT` only `free` (+ `published` for code_assets) | service role only |
| `audit_events` | **no client read or write** | service role only |

### The two-layer paywall (important)

Access control is split deliberately:

1. **Catalog visibility** (tracks/courses/modules/lessons): published content is
   publicly readable *regardless of `access_level`*. A visitor can SEE that a
   paid course exists (its title/description) — this is the marketing surface.
2. **Content access** (assets/code_assets + lesson body/video): paid/enterprise
   content is **not** broadly client-readable. Free content is public; paid
   content is served **only** through server-side entitlement checks using the
   service-role client. The fine-grained "does this user's subscription entitle
   them to this item" decision lives in the TypeScript server layer, NOT in SQL.

"See it exists" ≠ "consume it." RLS draws the coarse line (free = public, paid =
server-only); entitlement logic draws the fine line, server-side.

### Admin access

Admins receive **no client-side RLS escalation**. Privileged reads go through
`requireAdmin()` (`src/lib/auth/requireAdmin.ts`): it verifies the caller's
admin role via the RLS-respecting server client, then escalates to the
service-role client server-side. **Never** add an RLS policy granting admins
broad access based on a client-evaluated `role` claim — that concentrates the
highest-value privilege behind a client-influenced condition.

## Triggers & functions

- `set_updated_at()` — maintains `updated_at` on all mutable tables.
- `handle_new_user()` (`SECURITY DEFINER`, `search_path = ''`) — auto-creates a
  `profiles` row and default `user_preferences` row on `auth.users` insert.
- `protect_profile_privileged_columns()` — blocks authenticated users from
  changing `profiles.role` / `profiles.tier`; allows service role / postgres.

## Local development

```bash
npx supabase start          # start local stack (needs Docker)
npx supabase db reset       # re-run all migrations + seed.sql from scratch
npm run db:types            # regenerate src/types/database.ts after schema changes
```

Seed data (`supabase/seed.sql`) loads automatically on reset: sample
tracks/courses/modules/lessons including one free public-preview lesson, plus a
deliberate mix of draft/paid content for RLS verification.

## Discipline

- Schema change = **new migration** + **regenerate types** (`npm run db:types`)
  + commit both together. Stale `database.ts` causes confusing type errors.
- Security-affecting migrations (RLS, grants, `SECURITY DEFINER`) require human
  review before merge — RLS bugs are silent.