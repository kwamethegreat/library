select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'profiles' and privilege_type = 'INSERT';