select
  t.relname   as table_name,
  c.conname   as constraint_name,
  pg_get_constraintdef(c.oid) as definition
from pg_constraint c
join pg_class t on t.oid = c.conrelid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname = 'public'
  and c.contype = 'c'
  and t.relname in ('courses','lessons','assets','code_assets')
order by t.relname, c.conname;