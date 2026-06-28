-- user_preferences: per-user settings (notifications, communication).
-- user_id is BOTH primary key and foreign key -> strict 1:1 with profiles.

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  notification_settings jsonb not null default '{}'::jsonb,
  communication_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row
  execute function public.set_updated_at();

comment on table public.user_preferences is
  'Per-user settings (notifications/communication) as JSONB; 1:1 with profiles.';