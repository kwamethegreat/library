-- subscriptions RLS: users read ONLY their own subscription. No user writes.
-- All writes come from the Stripe webhook via the service_role client, which
-- bypasses RLS. "Writes restricted to service role" is enforced by granting
-- users SELECT only and writing no insert/update/delete policy.

-- Table-level grant: authenticated users get SELECT only. Deliberately NO
-- insert/update/delete grant -> users cannot write subscriptions at all.
grant select on public.subscriptions to authenticated;

-- SELECT: a user can read only the subscription row(s) tied to their user_id.
create policy "Users can read own subscription"
  on public.subscriptions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No INSERT / UPDATE / DELETE policies are defined.
-- With RLS enabled and no write policy + no write grant, those operations are
-- denied for the authenticated/anon roles. The service_role bypasses RLS and
-- performs all writes (via the Stripe webhook).