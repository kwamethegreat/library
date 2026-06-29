-- profiles RLS: users can read and update ONLY their own row.
-- role/tier are protected from self-modification via a trigger guard
-- (RLS is row-level, not column-level, so a policy alone can't protect columns).

-- Table-level grants for the authenticated role (the layer beneath RLS).
-- Note: NO insert/delete for users — profiles are created by the
-- handle_new_user trigger (service-definer) and never deleted by users.
grant select, update on public.profiles to authenticated;

-- SELECT: a user sees only their own profile.
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- UPDATE: a user can update only their own profile row.
-- (Column protection is handled by the trigger below, not this policy.)
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Guard: prevent authenticated users from changing role or tier.
-- The service_role bypasses RLS and triggers like this run for everyone,
-- so we explicitly allow the change only when NOT acting as a regular user
-- (i.e. when the current role is the privileged service_role/postgres).
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  -- Allow privileged backends (service_role / postgres) to change anything.
  if current_setting('request.jwt.role', true) = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  -- For everyone else (authenticated users), role and tier are immutable.
  if new.role is distinct from old.role then
    raise exception 'role cannot be changed by the user';
  end if;
  if new.tier is distinct from old.tier then
    raise exception 'tier cannot be changed by the user';
  end if;

  return new;
end;
$$;

create trigger profiles_protect_privileged_columns
  before update on public.profiles
  for each row
  execute function public.protect_profile_privileged_columns();