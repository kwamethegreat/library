set local role authenticated;
set local request.jwt.claims = '{"sub": "f368b654-a59f-4a8d-9373-a00bf37a4fcf", "role": "authenticated"}';

update public.user_preferences set notification_settings = '{"email": true}'::jsonb
where user_id = 'f368b654-a59f-4a8d-9373-a00bf37a4fcf';