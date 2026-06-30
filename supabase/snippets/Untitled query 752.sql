select email, email_confirmed_at, confirmed_at
from auth.users
order by created_at desc
limit 1;