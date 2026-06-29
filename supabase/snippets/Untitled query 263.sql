set local role authenticated;
set local request.jwt.claims = '{"sub": "8a857acc-794e-429f-a8cc-00e0be030302", "role": "authenticated"}';

update public.profiles set role = 'admin'
where id = '8a857acc-794e-429f-a8cc-00e0be030302';