-- Deal Jackets: financial records for sold vehicles (multi-tenant)

-- =============================================
-- 1. Tables
-- =============================================

create table if not exists deal_jackets (
  id                  uuid primary key default gen_random_uuid(),
  dealership_id       uuid not null references dealerships(id),
  deal_id             uuid unique references deals(id),
  vehicle_id          uuid not null unique references vehicles(id),
  customer_id         uuid not null references customers(id),
  sales_rep_id        uuid references users(id),
  jacket_number       text not null,
  sold_price          numeric(12,2) not null,
  total_tax           numeric(12,2) not null default 0,
  fees                jsonb not null default '{}'::jsonb,
  total_sale_price    numeric(12,2) not null,
  down_payment        numeric(12,2) not null default 0,
  amount_financed     numeric(12,2) not null default 0,
  balance_due         numeric(12,2) not null default 0,
  total_invested      numeric(12,2) not null default 0,
  additional_expenses numeric(12,2) not null default 0,
  commission_amount   numeric(12,2) not null default 0,
  commission_status   text not null default 'pending'
    check (commission_status in ('pending', 'paid')),
  profit_gross        numeric(12,2) not null,
  profit_net          numeric(12,2) not null,
  date_sold           timestamptz not null,
  created_by          uuid not null references users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,
  constraint uq_deal_jackets_dealership_jacket_number unique (dealership_id, jacket_number)
);

create table if not exists deal_jacket_documents (
  id                uuid primary key default gen_random_uuid(),
  dealership_id     uuid not null references dealerships(id),
  deal_jacket_id    uuid not null references deal_jackets(id) on delete cascade,
  file_url          text not null,
  file_type         text not null,
  document_name     text not null,
  uploaded_at       timestamptz not null default now(),
  created_by        uuid references users(id),
  deleted_at        timestamptz
);

create table if not exists deal_jacket_expenses_relation (
  id                uuid primary key default gen_random_uuid(),
  dealership_id     uuid not null references dealerships(id),
  deal_jacket_id    uuid not null references deal_jackets(id) on delete cascade,
  expense_id        uuid not null references vehicle_expenses(id),
  amount            numeric(12,2) not null,
  created_at        timestamptz not null default now(),
  constraint uq_deal_jacket_expense unique (deal_jacket_id, expense_id)
);

-- =============================================
-- 2. Indexes
-- =============================================

create index if not exists idx_deal_jackets_dealership
  on deal_jackets (dealership_id, date_sold desc)
  where deleted_at is null;

create index if not exists idx_deal_jackets_customer
  on deal_jackets (customer_id)
  where deleted_at is null;

create index if not exists idx_deal_jackets_sales_rep
  on deal_jackets (sales_rep_id)
  where deleted_at is null;

create index if not exists idx_deal_jacket_documents_jacket
  on deal_jacket_documents (deal_jacket_id)
  where deleted_at is null;

create index if not exists idx_deal_jacket_expenses_jacket
  on deal_jacket_expenses_relation (deal_jacket_id);

-- =============================================
-- 3. updated_at trigger
-- =============================================

drop trigger if exists trg_deal_jackets_updated_at on deal_jackets;
create trigger trg_deal_jackets_updated_at
  before update on deal_jackets
  for each row execute function set_updated_at();

-- =============================================
-- 4. Immutability: block changes to frozen financial fields
-- =============================================

create or replace function deal_jackets_prevent_financial_mutation()
returns trigger as $$
begin
  if (
    old.sold_price is distinct from new.sold_price
    or old.total_tax is distinct from new.total_tax
    or old.fees is distinct from new.fees
    or old.total_sale_price is distinct from new.total_sale_price
    or old.down_payment is distinct from new.down_payment
    or old.amount_financed is distinct from new.amount_financed
    or old.balance_due is distinct from new.balance_due
    or old.total_invested is distinct from new.total_invested
    or old.additional_expenses is distinct from new.additional_expenses
    or old.commission_amount is distinct from new.commission_amount
    or old.profit_gross is distinct from new.profit_gross
    or old.profit_net is distinct from new.profit_net
    or old.date_sold is distinct from new.date_sold
    or old.vehicle_id is distinct from new.vehicle_id
    or old.customer_id is distinct from new.customer_id
    or old.deal_id is distinct from new.deal_id
  ) then
    raise exception 'Deal jacket financial fields are immutable after creation';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_deal_jackets_immutable_financials on deal_jackets;
create trigger trg_deal_jackets_immutable_financials
  before update on deal_jackets
  for each row execute function deal_jackets_prevent_financial_mutation();

-- =============================================
-- 5. Row Level Security
-- =============================================

alter table deal_jackets enable row level security;
alter table deal_jacket_documents enable row level security;
alter table deal_jacket_expenses_relation enable row level security;

drop policy if exists "read own dealership deal jackets" on deal_jackets;
create policy "read own dealership deal jackets" on deal_jackets
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "insert deal jackets" on deal_jackets;
create policy "insert deal jackets" on deal_jackets
  for insert with check (
    dealership_id = auth_user_dealership_id()
    and auth_user_role() in ('super_admin', 'owner', 'manager')
  );

drop policy if exists "update deal jackets status only" on deal_jackets;
create policy "update deal jackets status only" on deal_jackets
  for update using (
    dealership_id = auth_user_dealership_id()
    and auth_user_role() in ('super_admin', 'owner', 'manager')
  ) with check (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "read own dealership deal jacket documents" on deal_jacket_documents;
create policy "read own dealership deal jacket documents" on deal_jacket_documents
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "insert deal jacket documents" on deal_jacket_documents;
create policy "insert deal jacket documents" on deal_jacket_documents
  for insert with check (
    dealership_id = auth_user_dealership_id()
    and auth_user_role() in ('super_admin', 'owner', 'manager')
  );

drop policy if exists "read own dealership deal jacket expense relations" on deal_jacket_expenses_relation;
create policy "read own dealership deal jacket expense relations" on deal_jacket_expenses_relation
  for select using (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "insert deal jacket expense relations" on deal_jacket_expenses_relation;
create policy "insert deal jacket expense relations" on deal_jacket_expenses_relation
  for insert with check (
    dealership_id = auth_user_dealership_id()
    and auth_user_role() in ('super_admin', 'owner', 'manager')
  );

-- =============================================
-- 6. Storage bucket (signed URL access)
-- =============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deal-jacket-documents',
  'deal-jacket-documents',
  false,
  10485760,
  '{ "image/jpeg", "image/png", "application/pdf" }'
)
on conflict (id) do nothing;

drop policy if exists "read own dealership deal jacket docs storage" on storage.objects;
create policy "read own dealership deal jacket docs storage"
  on storage.objects for select using (
    bucket_id = 'deal-jacket-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "upload own dealership deal jacket docs storage" on storage.objects;
create policy "upload own dealership deal jacket docs storage"
  on storage.objects for insert with check (
    bucket_id = 'deal-jacket-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );
