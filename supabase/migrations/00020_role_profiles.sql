-- AutoVault360 — Role-Specific Profile Tables
-- Extracts role-specific fields from users into dedicated profile tables
-- so each role can store additional data without bloating the users table.

-- =============================================
-- 1. Helper: current timestamp for data migration
-- =============================================

-- =============================================
-- 2. sales_rep_profiles
-- =============================================

create table if not exists sales_rep_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references users(id) on delete cascade,
  address         text,
  address2        text,
  city            text,
  state           text,
  zip             text,
  hire_date       date,
  commission_rate numeric(5,4) not null default 0.1000,
  monthly_goal    numeric(12,2) not null default 50000,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_sales_rep_profiles_user on sales_rep_profiles(user_id);

drop trigger if exists set_updated_at_sales_rep_profiles on sales_rep_profiles;
create trigger set_updated_at_sales_rep_profiles
  before update on sales_rep_profiles
  for each row execute function update_updated_at_column();

-- Migrate existing data from users to sales_rep_profiles
insert into sales_rep_profiles (user_id, address, address2, city, state, zip, hire_date, commission_rate, monthly_goal)
select
  id,
  address,
  address2,
  city,
  state,
  zip,
  hire_date,
  commission_rate,
  monthly_goal
from users
where role in ('sales_rep', 'manager')
  and (
    address is not null
    or address2 is not null
    or city is not null
    or state is not null
    or zip is not null
    or hire_date is not null
  )
on conflict (user_id) do nothing;

-- =============================================
-- 3. manager_profiles
-- =============================================

create table if not exists manager_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references users(id) on delete cascade,
  department      varchar(100),
  can_approve     boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_manager_profiles_user on manager_profiles(user_id);

drop trigger if exists set_updated_at_manager_profiles on manager_profiles;
create trigger set_updated_at_manager_profiles
  before update on manager_profiles
  for each row execute function update_updated_at_column();

-- Migrate existing managers
insert into manager_profiles (user_id)
select id from users
where role = 'manager'
on conflict (user_id) do nothing;

-- =============================================
-- 4. wholesale_dealer_profiles
-- =============================================

create table if not exists wholesale_dealer_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references users(id) on delete cascade,
  company_name    varchar(255),
  business_phone  varchar(50),
  contact_person  varchar(255),
  tax_id          varchar(100),
  license_number  varchar(100),
  address         text,
  city            text,
  state           text,
  zip             text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_wholesale_dealer_profiles_user on wholesale_dealer_profiles(user_id);

drop trigger if exists set_updated_at_wholesale_dealer_profiles on wholesale_dealer_profiles;
create trigger set_updated_at_wholesale_dealer_profiles
  before update on wholesale_dealer_profiles
  for each row execute function update_updated_at_column();

-- =============================================
-- 5. owner_profiles
-- =============================================

create table if not exists owner_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references users(id) on delete cascade,
  phone           varchar(50),
  title           varchar(100),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_owner_profiles_user on owner_profiles(user_id);

drop trigger if exists set_updated_at_owner_profiles on owner_profiles;
create trigger set_updated_at_owner_profiles
  before update on owner_profiles
  for each row execute function update_updated_at_column();

-- Migrate existing owners
insert into owner_profiles (user_id)
select id from users
where role = 'owner'
on conflict (user_id) do nothing;

-- =============================================
-- 6. RLS Policies
-- =============================================

alter table sales_rep_profiles enable row level security;
alter table manager_profiles enable row level security;
alter table wholesale_dealer_profiles enable row level security;
alter table owner_profiles enable row level security;

-- sales_rep_profiles: same dealership can read, admins can manage
drop policy if exists "sales_rep_profiles select own dealership" on sales_rep_profiles;
create policy "sales_rep_profiles select own dealership"
  on sales_rep_profiles for select
  using (
    exists (
      select 1 from users u
      where u.id = sales_rep_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
    )
    or is_super_admin()
  );

drop policy if exists "sales_rep_profiles manage admins" on sales_rep_profiles;
create policy "sales_rep_profiles manage admins"
  on sales_rep_profiles for insert
  with check (
    exists (
      select 1 from users u
      where u.id = sales_rep_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
        and auth_user_role() in ('owner', 'manager', 'super_admin')
    )
  );

drop policy if exists "sales_rep_profiles update admins" on sales_rep_profiles;
create policy "sales_rep_profiles update admins"
  on sales_rep_profiles for update
  using (
    exists (
      select 1 from users u
      where u.id = sales_rep_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
        and auth_user_role() in ('owner', 'manager', 'super_admin')
    )
  );

drop policy if exists "sales_rep_profiles delete admins" on sales_rep_profiles;
create policy "sales_rep_profiles delete admins"
  on sales_rep_profiles for delete
  using (
    exists (
      select 1 from users u
      where u.id = sales_rep_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
        and auth_user_role() in ('owner', 'manager', 'super_admin')
    )
  );

-- manager_profiles
drop policy if exists "manager_profiles select own dealership" on manager_profiles;
create policy "manager_profiles select own dealership"
  on manager_profiles for select
  using (
    exists (
      select 1 from users u
      where u.id = manager_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
    )
    or is_super_admin()
  );

drop policy if exists "manager_profiles manage admins" on manager_profiles;
create policy "manager_profiles manage admins"
  on manager_profiles for all
  using (
    exists (
      select 1 from users u
      where u.id = manager_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
        and auth_user_role() in ('owner', 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from users u
      where u.id = manager_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
        and auth_user_role() in ('owner', 'super_admin')
    )
  );

-- wholesale_dealer_profiles
drop policy if exists "wholesale_dealer_profiles select own dealership" on wholesale_dealer_profiles;
create policy "wholesale_dealer_profiles select own dealership"
  on wholesale_dealer_profiles for select
  using (
    exists (
      select 1 from users u
      where u.id = wholesale_dealer_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
    )
    or is_super_admin()
  );

drop policy if exists "wholesale_dealer_profiles manage" on wholesale_dealer_profiles;
create policy "wholesale_dealer_profiles manage"
  on wholesale_dealer_profiles for all
  using (
    exists (
      select 1 from users u
      where u.id = wholesale_dealer_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
        and auth_user_role() in ('owner', 'manager', 'super_admin')
    )
  )
  with check (
    exists (
      select 1 from users u
      where u.id = wholesale_dealer_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
        and auth_user_role() in ('owner', 'manager', 'super_admin')
    )
  );

-- owner_profiles
drop policy if exists "owner_profiles select own dealership" on owner_profiles;
create policy "owner_profiles select own dealership"
  on owner_profiles for select
  using (
    exists (
      select 1 from users u
      where u.id = owner_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
    )
    or is_super_admin()
  );

drop policy if exists "owner_profiles manage super_admin" on owner_profiles;
create policy "owner_profiles manage super_admin"
  on owner_profiles for all
  using (is_super_admin())
  with check (is_super_admin());
