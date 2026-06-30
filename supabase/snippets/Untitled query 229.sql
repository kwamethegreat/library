select 'tracks' as t, count(*) from public.tracks
union all select 'courses', count(*) from public.courses
union all select 'modules', count(*) from public.modules
union all select 'lessons', count(*) from public.lessons;