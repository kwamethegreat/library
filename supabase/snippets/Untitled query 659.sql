set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000000", "role": "authenticated"}';

select event_type from public.audit_events;