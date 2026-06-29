insert into public.audit_events (event_type, target_type, metadata)
values ('test.event', 'system', '{"note": "rls test"}'::jsonb);