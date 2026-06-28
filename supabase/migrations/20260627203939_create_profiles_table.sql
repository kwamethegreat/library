-- profiles: extends auth.users with app-specific fields.
-- One row per authenticated user, linked 1:1 to auth.users.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'user',
  tier text not null default 'free',
  onboarding_lane text,
  communication_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Role/tier check constraints: keep these in sync with the UserRole /
  -- UserTier union types in src/types/access.ts.
  constraint profiles_role_check
    check (role in ('user', 'admin')),
  constraint profiles_tier_check
    check (tier in ('free', 'paid', 'enterprise')),
  constraint profiles_onboarding_lane_check
    check (
      onboarding_lane is null
      or onboarding_lane in ('student', 'professional', 'enterprise')
    )
);

-- Keep updated_at current on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

comment on table public.profiles is
  'App-specific user data extending auth.users (role, tier, onboarding).';