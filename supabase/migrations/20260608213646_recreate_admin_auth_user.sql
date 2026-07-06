/*
# Recreate admin user in auth.users

The admin user was inserted directly via SQL which created a mismatch 
between the auth.users row and GoTrue's internal index. This migration 
deletes the stale row so the edge function can recreate it cleanly via 
the admin API, which properly registers the user with the auth service.

The profiles row is preserved — it will reconnect automatically when the
new auth.users row is created with the same UUID.
*/

-- Delete only the auth.users row (profiles row stays intact)
DELETE FROM auth.users WHERE id = '0b3ab27a-5b05-41ff-8859-9f19c12fe33a';
