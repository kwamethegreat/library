insert into public.assets (lesson_id, title, storage_path)
values ((select id from public.lessons where slug='what-is-react'), 'No Path', '   ');