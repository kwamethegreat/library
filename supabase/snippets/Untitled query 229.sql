set local role authenticated;
set local request.jwt.claims = '{"sub": "f368b654-a59f-4a8d-9373-a00bf37a4fcf", "role": "authenticated"}';

insert into public.user_progress (user_id, lesson_id, status)
values (
  'f368b654-a59f-4a8d-9373-a00bf37a4fcf',
  'e08466b8-d626-4c6a-a9fa-960b424055cb',
  'started'
);