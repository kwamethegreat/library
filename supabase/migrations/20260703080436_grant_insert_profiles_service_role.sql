-- ensureProfile (lazy profile creation) inserts into profiles via the
-- service-role client. Service role bypasses RLS but NOT table grants, so it
-- needs an explicit INSERT grant. (Normal signups insert via the
-- handle_new_user SECURITY DEFINER trigger, which is why this wasn't needed
-- before.)
grant insert on table public.profiles to service_role;