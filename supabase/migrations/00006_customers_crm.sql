-- AutoVault360 Customers CRM Extension
-- Extends customers table and adds notes, communications, documents

-- =============================================
-- 1. ENUMs
-- =============================================

do $$ begin
  create type customer_status as enum ('lead', 'active_deal', 'customer');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type customer_source as enum ('website', 'referral', 'walk_in', 'ads', 'social_media', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type communication_type as enum ('email', 'call', 'sms', 'meeting', 'inquiry');
exception
  when duplicate_object then null;
end $$;

-- =============================================
-- 2. Extend customers table
-- =============================================

alter table customers
  add column if not exists status customer_status not null default 'lead',
  add column if not exists sales_rep_id uuid references users(id),
  add column if not exists source customer_source,
  add column if not exists date_of_birth date,
  add column if not exists drivers_license_number text,
  add column if not exists address2 text;

create index if not exists idx_customers_status
  on customers (dealership_id, status) where deleted_at is null;

create index if not exists idx_customers_sales_rep
  on customers (sales_rep_id) where deleted_at is null;

create index if not exists idx_customers_source
  on customers (dealership_id, source) where deleted_at is null;

-- Backfill: customers with deals become 'customer'
update customers c
set status = 'customer'
where c.deleted_at is null
  and exists (
    select 1 from deals d
    where d.customer_id = c.id and d.deleted_at is null
  );

-- =============================================
-- 3. New tables
-- =============================================

create table if not exists customer_notes (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references customers(id),
  dealership_id   uuid not null references dealerships(id),
  body            text not null,
  created_by      uuid not null references users(id),
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create table if not exists customer_communications (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references customers(id),
  dealership_id   uuid not null references dealerships(id),
  type            communication_type not null default 'email',
  subject         text,
  body            text,
  occurred_at     timestamptz not null default now(),
  created_by      uuid not null references users(id),
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create table if not exists customer_documents (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references customers(id),
  dealership_id   uuid not null references dealerships(id),
  label           text not null,
  storage_path    text not null,
  created_by      uuid not null references users(id),
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- =============================================
-- 4. Indexes
-- =============================================

create index if not exists idx_customer_notes_customer
  on customer_notes (customer_id, created_at desc) where deleted_at is null;

create index if not exists idx_customer_communications_customer
  on customer_communications (customer_id, occurred_at desc) where deleted_at is null;

create index if not exists idx_customer_documents_customer
  on customer_documents (customer_id, created_at desc) where deleted_at is null;

-- =============================================
-- 5. RLS
-- =============================================

alter table customer_notes enable row level security;
alter table customer_communications enable row level security;
alter table customer_documents enable row level security;

-- customers UPDATE
drop policy if exists "update customers" on customers;
create policy "update customers" on customers
  for update using (
    dealership_id = auth_user_dealership_id()
  ) with check (
    dealership_id = auth_user_dealership_id()
  );

-- customer_notes
drop policy if exists "read own dealership customer notes" on customer_notes;
create policy "read own dealership customer notes" on customer_notes
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "insert customer notes" on customer_notes;
create policy "insert customer notes" on customer_notes
  for insert with check (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "update customer notes" on customer_notes;
create policy "update customer notes" on customer_notes
  for update using (
    dealership_id = auth_user_dealership_id()
  );

-- customer_communications
drop policy if exists "read own dealership customer communications" on customer_communications;
create policy "read own dealership customer communications" on customer_communications
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "insert customer communications" on customer_communications;
create policy "insert customer communications" on customer_communications
  for insert with check (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "update customer communications" on customer_communications;
create policy "update customer communications" on customer_communications
  for update using (
    dealership_id = auth_user_dealership_id()
  );

-- customer_documents
drop policy if exists "read own dealership customer documents" on customer_documents;
create policy "read own dealership customer documents" on customer_documents
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "insert customer documents" on customer_documents;
create policy "insert customer documents" on customer_documents
  for insert with check (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "update customer documents" on customer_documents;
create policy "update customer documents" on customer_documents
  for update using (
    dealership_id = auth_user_dealership_id()
  );
