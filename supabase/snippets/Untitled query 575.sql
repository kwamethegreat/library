-- Update something.
update public.tracks set title = 'Trigger Test Updated'
where slug = 'trigger-test';

-- updated_at should now be LATER than created_at.
select slug, created_at, updated_at,
       (updated_at > created_at) as updated_advanced
from public.tracks where slug = 'trigger-test';