-- audit_events RLS: fully locked down to clients.
-- NO client read (no select policy/grant) and NO client write (no insert
-- policy/grant). The service role bypasses RLS and performs all inserts
-- (logging) and all reads (admin views go through service-role server
-- functions, see next step). RLS is already enabled on this table (step 59);
-- the absence of any policy means deny-by-default for anon/authenticated.

-- Intentionally NO grants and NO policies for anon/authenticated.
-- This block documents the decision; there is nothing to grant.

-- (Optional hardening) Explicitly revoke any inherited privileges, to be
-- certain no client access exists even if defaults change.
revoke all on public.audit_events from anon, authenticated;

comment on table public.audit_events is
  'Append-only audit log. No client read or write; service-role only. RLS enabled, no client policies by design.';