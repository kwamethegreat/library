insert into public.assets (lesson_id, asset_type, title, storage_path, access_level)
values ((select id from public.lessons where slug='l1'),'pdf','Free PDF','lesson-assets/l1/free.pdf','free');

insert into public.assets (lesson_id, asset_type, title, storage_path, access_level)
values ((select id from public.lessons where slug='l1'),'pdf','Paid PDF','lesson-assets/l1/paid.pdf','paid');