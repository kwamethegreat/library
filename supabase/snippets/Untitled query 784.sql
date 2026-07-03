select has_schema_privilege('service_role', 'public', 'USAGE') as schema_usage,
       has_table_privilege('service_role', 'public.profiles', 'INSERT') as table_insert;