-- Bypasses RLS on users table so server actions can always read the
-- calling user's profile. The function runs with definer (owner) privileges.
create or replace function get_my_profile()
returns table (id uuid, dealership_id uuid, role text)
language sql
security definer
stable
as $$
  select id, dealership_id, role
  from users
  where auth_user_id = auth.uid()
  limit 1;
$$;
