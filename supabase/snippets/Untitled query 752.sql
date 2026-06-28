select tablename, indexname
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;