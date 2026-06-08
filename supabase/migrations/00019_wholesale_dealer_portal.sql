-- Wholesale Dealer Portal
-- Adds wholesale_dealer role support and wholesale inventory/transactions tables

-- Widen the role CHECK constraint on users table
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check
  check (role in ('super_admin', 'owner', 'manager', 'sales_rep', 'cpa', 'wholesale_dealer'));

-- Seed the wholesale dealer user
-- Email: dealer@autovault360.com (will be created via Supabase Auth UI / API)
-- The user's profile will be inserted once auth user is created

-- RLS: wholesale dealers can read their own profile
drop policy if exists "Wholesale dealer can read own profile" on users;
create policy "Wholesale dealer can read own profile"
  on users
  for select
  using (
    auth_user_id = auth.uid()
    and role = 'wholesale_dealer'
  );

-- Wholesale inventory table
create table if not exists wholesale_inventory (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references dealerships(id) on delete cascade,
  vin text not null,
  make text not null,
  model text not null,
  year integer not null,
  mileage integer,
  exterior_color text,
  interior_color text,
  stock_number text,
  cost_price numeric(12,2),
  asking_price numeric(12,2),
  status text not null default 'available'
    check (status in ('available', 'pending', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table wholesale_inventory enable row level security;

drop policy if exists "Dealership can read own wholesale inventory" on wholesale_inventory;
create policy "Dealership can read own wholesale inventory"
  on wholesale_inventory
  for select
  using (dealership_id = auth_user_dealership_id());

drop policy if exists "Dealership can insert wholesale inventory" on wholesale_inventory;
create policy "Dealership can insert wholesale inventory"
  on wholesale_inventory
  for insert
  with check (dealership_id = auth_user_dealership_id());

drop policy if exists "Dealership can update wholesale inventory" on wholesale_inventory;
create policy "Dealership can update wholesale inventory"
  on wholesale_inventory
  for update
  using (dealership_id = auth_user_dealership_id());

-- Dealer transactions (inter-dealership purchases)
create table if not exists dealer_transactions (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references wholesale_inventory(id) on delete cascade,
  seller_dealership_id uuid not null references dealerships(id) on delete cascade,
  buyer_dealership_id uuid not null references dealerships(id) on delete cascade,
  sale_price numeric(12,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table dealer_transactions enable row level security;

drop policy if exists "Participating dealership can read transaction" on dealer_transactions;
create policy "Participating dealership can read transaction"
  on dealer_transactions
  for select
  using (
    seller_dealership_id = auth_user_dealership_id()
    or buyer_dealership_id = auth_user_dealership_id()
  );

-- Wholesale expenses
create table if not exists wholesale_expenses (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references dealerships(id) on delete cascade,
  transaction_id uuid references dealer_transactions(id) on delete set null,
  category text not null,
  description text,
  amount numeric(12,2) not null,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table wholesale_expenses enable row level security;

drop policy if exists "Dealership can read own wholesale expenses" on wholesale_expenses;
create policy "Dealership can read own wholesale expenses"
  on wholesale_expenses
  for select
  using (dealership_id = auth_user_dealership_id());
