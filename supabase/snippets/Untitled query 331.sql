insert into public.lessons (module_id, slug, title, access_level)
values ((select id from public.modules where slug='getting-started'), 'bad', 'Bad', 'premium');