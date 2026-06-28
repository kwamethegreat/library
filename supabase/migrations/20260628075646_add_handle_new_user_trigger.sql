-- Auto-provision app rows when a new auth user is created.
-- Fires on INSERT into auth.users and creates the matching profiles row
-- plus a default user_preferences row. Keeps app data in lockstep with auth.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Create the profile (id = the new auth user's id).
  insert into public.profiles (id, display_name)
  values (
    new.id,
    -- Use a display name from signup metadata if provided, else null.
    coalesce(new.raw_user_meta_data ->> 'display_name', null)
  );

  -- Create default preferences (1:1 with the profile).
  insert into public.user_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

-- Attach the trigger to auth.users.
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

comment on function public.handle_new_user() is
  'Auto-creates a profiles row and default user_preferences when an auth user is created.';