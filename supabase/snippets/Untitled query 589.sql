set role anon;
select id, title from public.lessons;                          -- paid lesson GONE
select * from public.get_course_lesson_outline('aaaaaaaa-0000-0000-0000-000000000002');  -- paid lesson PRESENT, no body
select * from public.get_course_code_assets('aaaaaaaa-0000-0000-0000-000000000002');     -- 2 paid assets, no code_body
reset role;