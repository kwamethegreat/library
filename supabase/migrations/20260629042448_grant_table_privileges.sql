-- Table-level SELECT grants for public content tables.
-- RLS policies still filter WHICH rows each role sees; these GRANTs just
-- allow the role to access the table at all (the layer beneath RLS).

grant select on public.tracks   to anon, authenticated;
grant select on public.courses  to anon, authenticated;
grant select on public.modules  to anon, authenticated;
grant select on public.lessons  to anon, authenticated;