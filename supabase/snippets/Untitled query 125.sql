select
  p.id as profile_id,
  pref.user_id as preferences_user_id,
  (p.id = pref.user_id) as ids_match
from public.profiles p
join public.user_preferences pref on pref.user_id = p.id;