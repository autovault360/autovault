-- Allow dealership members to read coworker profiles for CRM and sales rep dashboards.
-- Uses auth_user_dealership_id() (SECURITY DEFINER) to avoid RLS recursion.

drop policy if exists "Dealership members can read coworker users" on users;
create policy "Dealership members can read coworker users"
  on users
  for select
  using (
    dealership_id is not null
    and dealership_id = auth_user_dealership_id()
  );
