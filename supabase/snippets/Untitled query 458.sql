insert into public.lessons (module_id, slug, title, access_level, is_public_preview)
values ((select id from public.modules where slug='getting-started'), 'teaser', 'Free Teaser', 'paid', true);