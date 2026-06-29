set local role authenticated;
set local request.jwt.claims = '{"sub": "55bce155-93a9-4423-84ea-c9ddbaf7b634", "role": "authenticated"}';

select slug, access_level from public.code_assets;