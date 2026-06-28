insert into public.lessons (module_id, slug, title, access_level, body_markdown)
values (
  (select id from public.modules where slug='getting-started'),
  'what-is-react', 'What is React?', 'free', '# Welcome\n\nReact is...'
);