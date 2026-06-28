insert into public.subscriptions
  (user_id, stripe_customer_id, stripe_subscription_id, status)
values
  (gen_random_uuid(), 'cus_test', 'sub_test', 'fake_status');