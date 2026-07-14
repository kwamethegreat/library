set role anon;
select slug, access_level, has_video from public.get_course_lesson_outline('aaaaaaaa-0000-0000-0000-000000000002');
reset role;