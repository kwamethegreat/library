set local role authenticated;
set local request.jwt.claims = '{"sub": "922d2e76-d39d-4583-b42f-a8c065a8a30f", "role": "authenticated"}';

insert into public.subscriptions
  (user_id, stripe_customer_id, stripe_subscription_id, status)
values
  ('922d2e76-d39d-4583-b42f-a8c065a8a30f', 'cus_hack', 'sub_hack', 'active');