-- subscriptions: local mirror of a user's Stripe subscription state.
-- Stripe is the source of truth; the webhook keeps this table in sync.
-- Read by entitlement logic to gate paid content without calling Stripe.

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Stripe subscription statuses (mirrors Stripe's status enum).
  constraint subscriptions_status_check
    check (
      status in (
        'trialing', 'active', 'past_due', 'canceled',
        'incomplete', 'incomplete_expired', 'unpaid', 'paused'
      )
    )
);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_updated_at();

-- Index for looking up a user's subscription(s) — the core entitlement query.
create index subscriptions_user_idx
  on public.subscriptions (user_id);

-- Index for webhook lookups by Stripe customer id.
create index subscriptions_stripe_customer_idx
  on public.subscriptions (stripe_customer_id);

comment on table public.subscriptions is
  'Local mirror of Stripe subscription state; kept in sync by the Stripe webhook.';