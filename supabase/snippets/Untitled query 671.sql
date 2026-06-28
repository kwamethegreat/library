insert into public.courses (track_id, slug, title, access_level)
values (
  (select id from public.tracks where slug = 'frontend-development'),
  'bad-course', 'Bad Course', 'premium'
);