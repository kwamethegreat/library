-- user_progress: one row per (user, lesson) recording started/completed state.
-- Powers "resume where you left off" and progress indicators.

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'started',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- status is restricted to the two tracked states.
  constraint user_progress_status_check
    check (status in ('started', 'completed')),

  -- One progress row per user per lesson.
  constraint user_progress_user_lesson_unique unique (user_id, lesson_id),

  -- completed_at must be set iff status is 'completed' (keeps them consistent).
  constraint user_progress_completed_at_consistency
    check (
      (status = 'completed' and completed_at is not null)
      or (status = 'started' and completed_at is null)
    )
);

create trigger user_progress_set_updated_at
  before update on public.user_progress
  for each row
  execute function public.set_updated_at();

-- Index for "all progress for a user" — the dashboard/resume query.
create index user_progress_user_idx
  on public.user_progress (user_id);

-- Index for "who has progressed on this lesson" — analytics/completion counts.
create index user_progress_lesson_idx
  on public.user_progress (lesson_id);

comment on table public.user_progress is
  'Per-user, per-lesson progress (started/completed); powers resume and progress UI.';