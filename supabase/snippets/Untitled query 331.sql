set local role authenticated;
set local request.jwt.claims = '{"sub": "<USER_A_ID>", "role": "authenticated"}';

insert into public.user_progress (user_id, lesson_id, status)
values ('<USER_A_ID>', (select id from public.lessons where slug='l1'), 'started');