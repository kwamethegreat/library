select email, onboarding_lane from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'onboard01@test.com';