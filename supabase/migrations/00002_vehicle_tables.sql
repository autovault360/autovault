-- AutoVault360 Vehicle Management Schema
-- Phase 1: Tables, RLS, Storage for all vehicle operations

-- =============================================
-- 1. ENUMs
-- =============================================

do $$ begin
  create type vehicle_status as enum ('in_stock', 'needs_attention', 'sold', 'loss');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type expense_priority as enum ('low', 'medium', 'high', 'urgent');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('unpaid', 'paid', 'partial');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type customer_type as enum ('individual', 'dealer', 'wholesale');
exception
  when duplicate_object then null;
end $$;

-- =============================================
-- 2. Tables
-- =============================================

-- 2.1 Vehicles (core inventory)
create table if not exists vehicles (
  id                  uuid primary key default gen_random_uuid(),
  dealership_id       uuid not null references dealerships(id),
  vin                 text not null,
  stock_number        text,
  make                text not null,
  model               text not null,
  trim                text,
  year                integer not null,
  body_style          text,
  mileage             integer,
  exterior_color      text,
  interior_color      text,
  drivetrain          text,
  fuel_type           text,
  engine              text,
  transmission        text,
  doors               integer,
  mpg                 text,
  lot_location        text,
  acquisition_date    date,
  acquisition_cost    numeric(12,2),
  asking_price        numeric(12,2),
  market_value        numeric(12,2),
  wholesale_price     numeric(12,2),
  reconditioning_cost numeric(12,2) not null default 0,
  total_invested      numeric(12,2) not null default 0,
  title_status        text,
  title_number        text,
  license_plate       text,
  state               text,
  expiration_date     date,
  seller_auction      text,
  purchase_type       text,
  odometer_status     text,
  notes               text,
  status              vehicle_status not null default 'in_stock',
  created_by          uuid not null references users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,

  constraint uq_vehicle_vin unique (dealership_id, vin)
);

-- 2.2 Vehicle Images (photos/gallery)
create table if not exists vehicle_images (
  id              uuid primary key default gen_random_uuid(),
  vehicle_id      uuid not null references vehicles(id),
  dealership_id   uuid not null references dealerships(id),
  storage_path    text not null,
  is_primary      boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- 2.3 Vehicle Expenses (repair costs)
create table if not exists vehicle_expenses (
  id              uuid primary key default gen_random_uuid(),
  vehicle_id      uuid not null references vehicles(id),
  dealership_id   uuid not null references dealerships(id),
  repair_date     date not null,
  category        text not null,
  repair_type     text not null,
  priority        expense_priority not null default 'medium',
  description     text not null,
  labor_cost      numeric(12,2) not null default 0,
  parts_cost      numeric(12,2) not null default 0,
  shop_vendor     text,
  other_fees      numeric(12,2) not null default 0,
  total_cost      numeric(12,2) not null,
  is_internal     boolean not null default false,
  payment_method  text,
  invoice_number  text,
  payment_status  payment_status not null default 'unpaid',
  date_paid       date,
  notes           text,
  created_by      uuid not null references users(id),
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- 2.4 Pricing History (price change tracking)
create table if not exists pricing_history (
  id                   uuid primary key default gen_random_uuid(),
  vehicle_id           uuid not null references vehicles(id),
  dealership_id        uuid not null references dealerships(id),
  previous_price       numeric(12,2),
  new_price            numeric(12,2) not null,
  wholesale_price      numeric(12,2),
  retail_price         numeric(12,2),
  min_acceptable_price numeric(12,2),
  target_profit        numeric(12,2),
  strategy             text not null,
  reason               text not null,
  effective_date       date not null,
  notes                text,
  changed_by           uuid not null references users(id),
  created_at           timestamptz not null default now(),
  deleted_at           timestamptz
);

-- 2.5 Status History (vehicle lifecycle tracking)
create table if not exists status_history (
  id              uuid primary key default gen_random_uuid(),
  vehicle_id      uuid not null references vehicles(id),
  dealership_id   uuid not null references dealerships(id),
  from_status     vehicle_status,
  to_status       vehicle_status not null,
  notes           text,
  changed_by      uuid not null references users(id),
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- 2.6 Customers
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  dealership_id   uuid not null references dealerships(id),
  type            customer_type not null default 'individual',
  name            text not null,
  phone           text,
  email           text,
  address         text,
  city            text,
  state           text,
  zip             text,
  created_by      uuid not null references users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

-- 2.7 Deals (mark-as-sold records)
create table if not exists deals (
  id                    uuid primary key default gen_random_uuid(),
  vehicle_id            uuid not null unique references vehicles(id),
  customer_id           uuid not null references customers(id),
  dealership_id         uuid not null references dealerships(id),
  sale_date             date not null,
  total_price_otd       numeric(12,2) not null,
  sales_tax_amount      numeric(12,2) not null default 0,
  license_fees          numeric(12,2) not null default 0,
  dmv_fees              numeric(12,2) not null default 0,
  other_fees            numeric(12,2) not null default 0,
  total_collected       numeric(12,2) not null,
  ros_number            text,
  zip_of_sale           text,
  buyer_id_front_path   text,
  buyer_id_back_path    text,
  drivers_license_path  text,
  other_doc_path        text,
  notes                 text,
  created_by            uuid not null references users(id),
  created_at            timestamptz not null default now(),
  deleted_at            timestamptz
);

-- 2.8 Vehicle Losses (mark-as-loss records)
create table if not exists vehicle_losses (
  id                     uuid primary key default gen_random_uuid(),
  vehicle_id             uuid not null unique references vehicles(id),
  dealership_id          uuid not null references dealerships(id),
  loss_date              date not null,
  loss_reason            text not null,
  loss_type              text not null,
  explanation            text not null,
  total_investment       numeric(12,2) not null default 0,
  total_expenses         numeric(12,2) not null default 0,
  total_cost_basis       numeric(12,2) not null default 0,
  estimated_loss_amount  numeric(12,2) not null,
  insurance_proceeds     numeric(12,2) not null default 0,
  net_loss               numeric(12,2) not null,
  document_paths         text[] default '{}',
  created_by             uuid not null references users(id),
  created_at             timestamptz not null default now(),
  deleted_at             timestamptz
);

-- 2.9 Audit Logs (change tracking)
create table if not exists audit_logs (
  id            uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references dealerships(id),
  entity_type   text not null,
  entity_id     uuid not null,
  action        text not null,
  old_values    jsonb,
  new_values    jsonb,
  changed_by    uuid not null references users(id),
  ip_address    text,
  created_at    timestamptz not null default now()
);

-- =============================================
-- 3. Indexes
-- =============================================

-- vehicles
create index if not exists idx_vehicles_dealership_status
  on vehicles (dealership_id, status) where deleted_at is null;
create index if not exists idx_vehicles_dealership_created
  on vehicles (dealership_id, created_at desc) where deleted_at is null;
create index if not exists idx_vehicles_make_model
  on vehicles (make, model) where deleted_at is null;
create index if not exists idx_vehicles_created_by
  on vehicles (created_by);

-- vehicle_images
create index if not exists idx_vehicle_images_vehicle
  on vehicle_images (vehicle_id, sort_order) where deleted_at is null;

-- vehicle_expenses
create index if not exists idx_vehicle_expenses_vehicle
  on vehicle_expenses (vehicle_id) where deleted_at is null;
create index if not exists idx_vehicle_expenses_created_by
  on vehicle_expenses (created_by);

-- pricing_history
create index if not exists idx_pricing_history_vehicle
  on pricing_history (vehicle_id, created_at desc) where deleted_at is null;

-- status_history
create index if not exists idx_status_history_vehicle
  on status_history (vehicle_id, created_at desc) where deleted_at is null;

-- customers
create index if not exists idx_customers_dealership
  on customers (dealership_id) where deleted_at is null;
create index if not exists idx_customers_phone
  on customers (phone) where deleted_at is null;
create index if not exists idx_customers_email
  on customers (email) where deleted_at is null;

-- deals
create index if not exists idx_deals_customer
  on deals (customer_id) where deleted_at is null;
create index if not exists idx_deals_sale_date
  on deals (sale_date desc) where deleted_at is null;
create index if not exists idx_deals_created_by
  on deals (created_by);

-- vehicle_losses
create index if not exists idx_vehicle_losses_vehicle
  on vehicle_losses (vehicle_id) where deleted_at is null;
create index if not exists idx_vehicle_losses_created_by
  on vehicle_losses (created_by);

-- audit_logs
create index if not exists idx_audit_logs_dealership
  on audit_logs (dealership_id, created_at desc);
create index if not exists idx_audit_logs_entity
  on audit_logs (entity_type, entity_id);
create index if not exists idx_audit_logs_changed_by
  on audit_logs (changed_by);

-- =============================================
-- 4. Row-Level Security
-- =============================================

alter table vehicles enable row level security;
alter table vehicle_images enable row level security;
alter table vehicle_expenses enable row level security;
alter table pricing_history enable row level security;
alter table status_history enable row level security;
alter table customers enable row level security;
alter table deals enable row level security;
alter table vehicle_losses enable row level security;
alter table audit_logs enable row level security;

-- 4.1 Helper functions for RLS policies

create or replace function auth_user_dealership_id()
returns uuid as $$
  select dealership_id from users where auth_user_id = auth.uid();
$$ language sql stable;

create or replace function auth_user_role()
returns text as $$
  select role from users where auth_user_id = auth.uid();
$$ language sql stable;

-- 4.2 READ policies (all authenticated users in same dealership)

drop policy if exists "read own dealership vehicles" on vehicles;
create policy "read own dealership vehicles" on vehicles
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "read own dealership images" on vehicle_images;
create policy "read own dealership images" on vehicle_images
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "read own dealership expenses" on vehicle_expenses;
create policy "read own dealership expenses" on vehicle_expenses
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "read own dealership pricing" on pricing_history;
create policy "read own dealership pricing" on pricing_history
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "read own dealership status history" on status_history;
create policy "read own dealership status history" on status_history
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "read own dealership customers" on customers;
create policy "read own dealership customers" on customers
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "read own dealership deals" on deals;
create policy "read own dealership deals" on deals
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "read own dealership losses" on vehicle_losses;
create policy "read own dealership losses" on vehicle_losses
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "read own dealership audit logs" on audit_logs;
create policy "read own dealership audit logs" on audit_logs
  for select using (
    dealership_id = auth_user_dealership_id()
  );

-- 4.3 INSERT policies (role-gated)

drop policy if exists "insert vehicles" on vehicles;
create policy "insert vehicles" on vehicles
  for insert with check (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "insert images" on vehicle_images;
create policy "insert images" on vehicle_images
  for insert with check (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "insert expenses" on vehicle_expenses;
create policy "insert expenses" on vehicle_expenses
  for insert with check (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "insert pricing" on pricing_history;
create policy "insert pricing" on pricing_history
  for insert with check (
    dealership_id = auth_user_dealership_id()
    and auth_user_role() in ('super_admin', 'owner', 'manager', 'cpa')
  );

drop policy if exists "insert deals" on deals;
create policy "insert deals" on deals
  for insert with check (
    dealership_id = auth_user_dealership_id()
    and auth_user_role() in ('super_admin', 'owner', 'manager')
  );

drop policy if exists "insert losses" on vehicle_losses;
create policy "insert losses" on vehicle_losses
  for insert with check (
    dealership_id = auth_user_dealership_id()
    and auth_user_role() in ('super_admin', 'owner', 'manager')
  );

drop policy if exists "insert customers" on customers;
create policy "insert customers" on customers
  for insert with check (
    dealership_id = auth_user_dealership_id()
  );

-- 4.4 UPDATE policies

drop policy if exists "update vehicles" on vehicles;
create policy "update vehicles" on vehicles
  for update using (
    dealership_id = auth_user_dealership_id()
  ) with check (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "update images" on vehicle_images;
create policy "update images" on vehicle_images
  for update using (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "update expenses" on vehicle_expenses;
create policy "update expenses" on vehicle_expenses
  for update using (
    dealership_id = auth_user_dealership_id()
  );

-- =============================================
-- 5. Triggers (auto updated_at)
-- =============================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_vehicles_updated_at on vehicles;
create trigger trg_vehicles_updated_at
  before update on vehicles
  for each row execute function set_updated_at();

drop trigger if exists trg_customers_updated_at on customers;
create trigger trg_customers_updated_at
  before update on customers
  for each row execute function set_updated_at();

-- =============================================
-- 6. RPC Functions
-- =============================================

-- Recalculates reconditioning_cost and total_invested for a vehicle
create or replace function update_vehicle_financials(p_vehicle_id uuid)
returns void as $$
declare
  v_acquisition_cost numeric(12,2);
  v_reconditioning_cost numeric(12,2);
begin
  select acquisition_cost into v_acquisition_cost
  from vehicles where id = p_vehicle_id;

  select coalesce(sum(total_cost), 0) into v_reconditioning_cost
  from vehicle_expenses
  where vehicle_id = p_vehicle_id and deleted_at is null;

  update vehicles
  set
    reconditioning_cost = v_reconditioning_cost,
    total_invested = coalesce(v_acquisition_cost, 0) + v_reconditioning_cost
  where id = p_vehicle_id;
end;
$$ language plpgsql;

-- =============================================
-- 7. Storage Buckets + Policies
-- =============================================

-- Create buckets (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vehicle-images', 'vehicle-images', false, 10485760, '{ "image/jpeg", "image/png" }'),
  ('vehicle-documents', 'vehicle-documents', false, 10485760, '{ "image/jpeg", "image/png", "application/pdf" }')
on conflict (id) do nothing;

-- === vehicle-images policies ===

drop policy if exists "read own dealership images" on storage.objects;
create policy "read own dealership images"
  on storage.objects for select using (
    bucket_id = 'vehicle-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "upload own dealership images" on storage.objects;
create policy "upload own dealership images"
  on storage.objects for insert with check (
    bucket_id = 'vehicle-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "delete own dealership images" on storage.objects;
create policy "delete own dealership images"
  on storage.objects for delete using (
    bucket_id = 'vehicle-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

-- === vehicle-documents policies ===

drop policy if exists "read own dealership documents" on storage.objects;
create policy "read own dealership documents"
  on storage.objects for select using (
    bucket_id = 'vehicle-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "upload own dealership documents" on storage.objects;
create policy "upload own dealership documents"
  on storage.objects for insert with check (
    bucket_id = 'vehicle-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "delete own dealership documents" on storage.objects;
create policy "delete own dealership documents"
  on storage.objects for delete using (
    bucket_id = 'vehicle-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );
