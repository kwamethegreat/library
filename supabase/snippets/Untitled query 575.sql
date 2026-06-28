insert into public.lessons (module_id, slug, title)
values ((select id from public.modules where slug='getting-started'), 'what-is-react', 'What is React?');
