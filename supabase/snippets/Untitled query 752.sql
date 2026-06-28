insert into public.tracks (slug, title)
values ('frontend-development', 'Frontend Development');
insert into public.courses (track_id, slug, title, access_level, level)
values (
  (select id from public.tracks where slug = 'frontend-development'),
  'intro-to-react', 'Intro to React', 'paid', 'beginner'
);