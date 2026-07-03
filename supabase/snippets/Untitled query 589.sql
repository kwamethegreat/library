select p.id, u.email, p.role, p.tier, p.display_name
   from public.profiles p join auth.users u on u.id = p.id
   order by u.created_at desc limit 5;