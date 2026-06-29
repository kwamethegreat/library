-- Seed a lesson to reference (as postgres).
insert into public.tracks (slug, title, published) values ('t1', 'Track 1', true);
insert into public.courses (track_id, slug, title) values ((select id from public.tracks where slug='t1'), 'c1', 'Course 1');
insert into public.modules (course_id, slug, title) values ((select id from public.courses where slug='c1'), 'm1', 'Module 1');
insert into public.lessons (module_id, slug, title) values ((select id from public.modules where slug='m1'), 'l1', 'Lesson 1');