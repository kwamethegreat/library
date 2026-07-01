select email, onboarding_lane from public.profiles p
join auth.users u on u.id = p.id
order by u.created_at desc limit 3;