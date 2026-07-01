select u.email, u.email_confirmed_at, p.onboarding_lane
from auth.users u
join public.profiles p on p.id = u.id
order by u.created_at desc
limit 5;