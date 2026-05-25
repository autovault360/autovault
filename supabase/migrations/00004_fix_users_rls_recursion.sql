-- Fix infinite recursion on the users table.
-- Policies and helper functions were querying `users` while RLS on `users`
-- was being evaluated, which triggers PostgreSQL error 42P17.
-- SECURITY DEFINER helpers read the caller's profile without re-entering RLS.

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where auth_user_id = auth.uid()
      and role = 'super_admin'
  );
$$;

create or replace function public.auth_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.users
  where auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.auth_user_dealership_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select dealership_id
      from public.users
      where auth_user_id = auth.uid()
    ),
    case
      when (
        select role
        from public.users
        where auth_user_id = auth.uid()
      ) = 'super_admin'
      then (
        select id
        from public.dealerships
        where status = 'active'
        order by created_at asc
        limit 1
      )
    end
  );
$$;

-- Dealership policies previously queried users directly.
drop policy if exists "Super admin can do everything on dealerships" on dealerships;
create policy "Super admin can do everything on dealerships"
  on dealerships
  using (is_super_admin())
  with check (is_super_admin());

-- Users policies previously used self-referential EXISTS subqueries.
drop policy if exists "Super admin can read all users" on users;
create policy "Super admin can read all users"
  on users
  for select
  using (is_super_admin());

drop policy if exists "Super admin can insert users" on users;
create policy "Super admin can insert users"
  on users
  for insert
  with check (is_super_admin());

drop policy if exists "Super admin can update users" on users;
create policy "Super admin can update users"
  on users
  for update
  using (is_super_admin());

drop policy if exists "Super admin can delete users" on users;
create policy "Super admin can delete users"
  on users
  for delete
  using (is_super_admin());
