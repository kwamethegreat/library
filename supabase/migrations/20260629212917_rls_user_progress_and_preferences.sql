-- user_progress + user_preferences RLS: users have full read/write on ONLY
-- their own rows. No privileged columns to guard (unlike profiles), so users
-- own these rows completely.

-- ============================================================
-- user_progress
-- ============================================================

-- Users create, read, and update their own progress rows.
grant select, insert, update on public.user_progress to authenticated;

-- SELECT: own rows only.
create policy "Users can read own progress"
  on public.user_progress
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT: can only create progress rows for themselves.
create policy "Users can insert own progress"
  on public.user_progress
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE: can only update their own progress rows.
create policy "Users can update own progress"
  on public.user_progress
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ============================================================
-- user_preferences
-- ============================================================

-- Users read and update their own preferences. (Rows are auto-created by the
-- handle_new_user trigger, so no INSERT grant is strictly required — but it's
-- harmless to allow, and an upsert path may want it. We grant select+update
-- to match the "row already exists" reality; add insert if you upsert.)
grant select, update on public.user_preferences to authenticated;

-- SELECT: own row only.
create policy "Users can read own preferences"
  on public.user_preferences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- UPDATE: own row only.
create policy "Users can update own preferences"
  on public.user_preferences
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);