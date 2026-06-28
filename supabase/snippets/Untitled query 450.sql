insert into public.lessons (module_id, slug, title, video_provider, video_asset_id)
values ((select id from public.modules where slug='getting-started'), 'vid', 'Vid', 'dailymotion', 'abc');