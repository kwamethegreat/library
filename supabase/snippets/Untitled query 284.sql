set local role authenticated;
set local request.jwt.claims = '{"sub": "72d280d6-b56d-4f83-ba61-73d96321c200", "role": "authenticated"}';

insert into public.user_progress (user_id, lesson_id, status)
values ('72d280d6-b56d-4f83-ba61-73d96321c200', (select id from public.lessons where slug='l1'), 'started');