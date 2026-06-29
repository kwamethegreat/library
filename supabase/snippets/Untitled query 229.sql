select event_object_table, trigger_name
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table;