-- Confirm a profile was auto-created.
select id, display_name, role, tier from public.profiles;

-- Confirm default preferences were auto-created.
select user_id, notification_settings, communication_settings
from public.user_preferences;