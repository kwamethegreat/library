insert into public.audit_events (event_type, target_type, target_id, metadata)
values (
  'course.published',
  'course',
  gen_random_uuid(),
  '{"published_by": "system", "reason": "scheduled"}'::jsonb
);