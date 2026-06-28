insert into public.assets (lesson_id, asset_type, title, storage_path)
values ((select id from public.lessons where slug='what-is-react'), 'video', 'Bad Type', 'x/y.mp4');