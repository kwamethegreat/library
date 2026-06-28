insert into public.code_assets (lesson_id, slug, title)
values ((select id from public.lessons where slug='what-is-react'), 'empty', 'Empty');