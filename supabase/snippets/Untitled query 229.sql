set local role authenticated;
set local request.jwt.claims = '{"sub": "00000000-0000-0000-0000-000000000000", "role": "authenticated"}';

insert into public.audit_events (event_type) values ('hack.attempt');