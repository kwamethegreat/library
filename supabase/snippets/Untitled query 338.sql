set role anon;
select 'direct_row_read' as source, slug, access_level from public.lessons
union all
select 'outline_rpc', slug, access_level from public.get_course_lesson_outline('aaaaaaaa-0000-0000-0000-000000000002');
reset role;