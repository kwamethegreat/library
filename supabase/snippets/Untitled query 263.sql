-- As postgres, check there's an active session for that user.
select count(*) from auth.sessions;