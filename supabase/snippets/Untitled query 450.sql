insert into public.assets (lesson_id, title, storage_path, access_level)
values ((select id from public.lessons where slug='what-is-react'), 'Bad', 'x/y.pdf', 'premium');