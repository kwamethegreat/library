-- (as postgres) lesson chain + free and paid code_assets.
insert into public.tracks (slug, title, published) values ('t1','Track 1',true);
insert into public.courses (track_id, slug, title) values ((select id from public.tracks where slug='t1'),'c1','Course 1');
insert into public.modules (course_id, slug, title) values ((select id from public.courses where slug='c1'),'m1','Module 1');
insert into public.lessons (module_id, slug, title, published) values ((select id from public.modules where slug='m1'),'l1','Lesson 1', true);

insert into public.code_assets (lesson_id, slug, title, code_body, access_level, published)
values ((select id from public.lessons where slug='l1'),'free-snippet','Free Snippet','console.log(1);','free', true);

insert into public.code_assets (lesson_id, slug, title, code_body, access_level, published)
values ((select id from public.lessons where slug='l1'),'paid-snippet','Paid Snippet','console.log(2);','paid', true);