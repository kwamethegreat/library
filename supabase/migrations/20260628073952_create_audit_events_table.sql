-- audit_events: append-only log of significant actions (who did what to what).
-- Records are inserted, never updated or deleted. The accountability trail.

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  -- event_type must be non-empty (it's the core of the log entry).
  constraint audit_events_event_type_not_empty
    check (length(trim(event_type)) > 0)
);

-- Index for "what did this actor do" queries.
create index audit_events_actor_idx
  on public.audit_events (actor_id);

-- Index for "what happened to this target" queries.
create index audit_events_target_idx
  on public.audit_events (target_type, target_id);

-- Index for time-ordered log scans (most recent first).
create index audit_events_created_at_idx
  on public.audit_events (created_at desc);

comment on table public.audit_events is
  'Append-only audit log of significant actions; never updated or deleted.';