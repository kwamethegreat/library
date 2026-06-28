insert into public.user_progress (user_id, lesson_id, status, completed_at)
values (gen_random_uuid(), gen_random_uuid(), 'completed', null);