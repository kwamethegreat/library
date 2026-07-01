select u.email, s.created_at, s.not_after
from auth.sessions s
join auth.users u on u.id = s.user_id
order by s.created_at desc
limit 5;