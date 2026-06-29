set local role authenticated;
set local request.jwt.claims = '{"sub": "cc864855-1399-478f-a77c-9a603fc84fc0", "role": "authenticated"}';

select stripe_subscription_id, status from public.subscriptions;