update public.lessons
set body_markdown = repeat('> ', 6000) || 'deep'
where slug = 'what-is-react';