delete from public.courses where slug = 'intro-to-react';
select count(*) from public.modules
where course_id not in (select id from public.courses);