select
  p.id,
  p.role,
  p.tier,
  pref.user_id,
  (p.id = pref.user_id) as ids_match
from public.profiles p
join public.user_preferences pref on pref.user_id = p.id;