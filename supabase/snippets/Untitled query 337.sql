select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relname = 'profiles' and relnamespace = 'public'::regnamespace;