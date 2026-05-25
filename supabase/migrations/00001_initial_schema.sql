-- AutoVault360 Initial Schema
-- Multi-tenant SaaS for dealership management

-- 0. Extensions
create extension if not exists "pgcrypto";

-- 1. Dealerships (tenants)
create table if not exists dealerships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  email text,
  phone text,
  address text,
  status text not null default 'active' check (status in ('active', 'suspended', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Users (platform-wide, including super admin)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  dealership_id uuid references dealerships(id) on delete set null,
  email text not null,
  full_name text,
  role text not null check (role in ('super_admin', 'owner', 'manager', 'sales_rep', 'cpa')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Indexes
create index if not exists idx_users_auth_user_id on users(auth_user_id);
create index if not exists idx_users_dealership_id on users(dealership_id);
create index if not exists idx_users_role on users(role);
create index if not exists idx_dealerships_slug on dealerships(slug);
create index if not exists idx_dealerships_status on dealerships(status);

-- 4. Auto-update updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_dealerships on dealerships;
create trigger set_updated_at_dealerships
  before update on dealerships
  for each row execute function update_updated_at_column();

drop trigger if exists set_updated_at_users on users;
create trigger set_updated_at_users
  before update on users
  for each row execute function update_updated_at_column();

-- 5. Row Level Security
alter table dealerships enable row level security;
alter table users enable row level security;

-- 6. RLS Policies for dealerships
drop policy if exists "Super admin can do everything on dealerships" on dealerships;
create policy "Super admin can do everything on dealerships"
  on dealerships
  using (
    exists (
      select 1 from users
      where users.auth_user_id = auth.uid()
      and users.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from users
      where users.auth_user_id = auth.uid()
      and users.role = 'super_admin'
    )
  );

-- 7. RLS Policies for users
drop policy if exists "Users can read own record" on users;
create policy "Users can read own record"
  on users
  for select
  using (auth_user_id = auth.uid());

drop policy if exists "Super admin can read all users" on users;
create policy "Super admin can read all users"
  on users
  for select
  using (
    exists (
      select 1 from users
      where users.auth_user_id = auth.uid()
      and users.role = 'super_admin'
    )
  );

drop policy if exists "Super admin can insert users" on users;
create policy "Super admin can insert users"
  on users
  for insert
  with check (
    exists (
      select 1 from users
      where users.auth_user_id = auth.uid()
      and users.role = 'super_admin'
    )
  );

drop policy if exists "Super admin can update users" on users;
create policy "Super admin can update users"
  on users
  for update
  using (
    exists (
      select 1 from users
      where users.auth_user_id = auth.uid()
      and users.role = 'super_admin'
    )
  );

drop policy if exists "Super admin can delete users" on users;
create policy "Super admin can delete users"
  on users
  for delete
  using (
    exists (
      select 1 from users
      where users.auth_user_id = auth.uid()
      and users.role = 'super_admin'
    )
  );
