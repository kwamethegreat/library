insert into public.courses (track_id, slug, title)
values ((select id from public.tracks where slug='frontend-development'), 'intro-to-react', 'Intro to React');