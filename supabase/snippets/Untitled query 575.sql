set local role authenticated;
set local request.jwt.claims = '{"sub": "922d2e76-d39d-4583-b42f-a8c065a8a30f", "role": "authenticated"}';

select stripe_subscription_id, status from public.subscriptions;