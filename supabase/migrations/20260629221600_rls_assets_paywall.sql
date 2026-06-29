-- assets + code_assets RLS: the CONTENT PAYWALL.
-- Clients may read ONLY free content. Paid/enterprise content is NOT exposed to
-- anon/authenticated by any policy -- it is served exclusively through
-- server-side entitlement checks using the service-role client (which bypasses
-- RLS). This keeps entitlement logic in one place (the server), not in SQL.

-- ============================================================
-- assets  (no `published` column -- inherits visibility from parent lesson;
--          gated here on access_level only)
-- ============================================================

grant select on public.assets to anon, authenticated;

create policy "Public can read free assets"
  on public.assets
  for select
  to anon, authenticated
  using (access_level = 'free');

-- ============================================================
-- code_assets  (has its own `published` flag -- gate on both)
-- ============================================================

grant select on public.code_assets to anon, authenticated;

create policy "Public can read free published code assets"
  on public.code_assets
  for select
  to anon, authenticated
  using (access_level = 'free' and published = true);