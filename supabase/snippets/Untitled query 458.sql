set local role authenticated;
set local request.jwt.claims = '{"sub": "922d2e76-d39d-4583-b42f-a8c065a8a30f", "role": "authenticated"}';

update public.subscriptions set status = 'active' where user_id = '922d2e76-d39d-4583-b42f-a8c065a8a30f';