set local role authenticated;
set local request.jwt.claims = '{"sub": "<USER_A_ID>", "role": "authenticated"}';

select stripe_subscription_id, status from public.subscriptions;