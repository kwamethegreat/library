-- Enable Row Level Security on every public table.
-- After this, each table DENIES all access until policies are added
-- (policies come in the following migrations, items 60-62).
-- service_role and SECURITY DEFINER functions bypass RLS by design.

alter table public.profiles            enable row level security;
alter table public.tracks              enable row level security;
alter table public.courses             enable row level security;
alter table public.modules             enable row level security;
alter table public.lessons             enable row level security;
alter table public.assets              enable row level security;
alter table public.code_assets         enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.user_progress       enable row level security;
alter table public.user_preferences    enable row level security;
alter table public.audit_events        enable row level security;