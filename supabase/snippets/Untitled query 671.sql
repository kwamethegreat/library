-- Insert a row, capturing its timestamps.
insert into public.tracks (slug, title)
values ('trigger-test', 'Trigger Test');

-- Check created_at and updated_at are equal at creation.
select slug, created_at, updated_at,
       (created_at = updated_at) as equal_at_insert
from public.tracks where slug = 'trigger-test';