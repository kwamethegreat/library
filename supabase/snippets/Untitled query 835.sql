create or replace function public.ensure_profile_for_current_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    auth.uid(),
    (select raw_user_meta_data ->> 'display_name'
       from auth.users where id = auth.uid())
  )
  on conflict (id) do nothing;
end;
$$;

grant execute on function public.ensure_profile_for_current_user() to authenticated;