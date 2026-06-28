-- Example: only if some table was missing its trigger.
create trigger <table>_set_updated_at
  before update on public.<table>
  for each row
  execute function public.set_updated_at();