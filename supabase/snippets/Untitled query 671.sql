insert into public.modules (course_id, slug, title)
values (
  (select id from public.courses where slug = 'intro-to-react'),
  'getting-started', 'Getting Started'
);