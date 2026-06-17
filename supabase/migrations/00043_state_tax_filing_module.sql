-- State Tax Filing Module
-- Transforms state-tax from a static dashboard into a filing organization system.
--
-- Tables:
--   1. dealership_tax_settings  — per-dealership filing config
--   2. tax_filing_periods        — generated filing periods (Q1 2026, etc.)
--   3. filing_period_deals       — links deal_jackets to filing periods
--   4. tax_filing_documents      — uploaded receipts / confirmation PDFs

-- =============================================
-- 1. dealership_tax_settings
-- =============================================

create table if not exists dealership_tax_settings (
  id                uuid primary key default gen_random_uuid(),
  dealership_id     uuid not null references dealerships(id) on delete cascade,
  state             text,
  filing_frequency  text default 'quarterly'
                    check (filing_frequency in ('monthly', 'quarterly', 'annual', 'custom')),
  reminder_days     integer default 14,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (dealership_id)
);

-- =============================================
-- 2. tax_filing_periods
-- =============================================

create table if not exists tax_filing_periods (
  id                uuid primary key default gen_random_uuid(),
  dealership_id     uuid not null references dealerships(id) on delete cascade,
  name              text not null,
  start_date        date not null,
  end_date          date not null,
  due_date          date not null,
  status            text not null default 'open'
                    check (status in ('open', 'due', 'paid', 'filed', 'closed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_tax_filing_periods_dealership
  on tax_filing_periods (dealership_id, start_date, end_date);

-- =============================================
-- 3. filing_period_deals
-- =============================================

create table if not exists filing_period_deals (
  id                uuid primary key default gen_random_uuid(),
  filing_period_id  uuid not null references tax_filing_periods(id) on delete cascade,
  deal_jacket_id    uuid not null references deal_jackets(id) on delete cascade,
  created_at        timestamptz not null default now(),
  unique (filing_period_id, deal_jacket_id)
);

create index if not exists idx_filing_period_deals_period
  on filing_period_deals (filing_period_id);

create index if not exists idx_filing_period_deals_jacket
  on filing_period_deals (deal_jacket_id);

-- =============================================
-- 4. tax_filing_documents
-- =============================================

create table if not exists tax_filing_documents (
  id                uuid primary key default gen_random_uuid(),
  filing_period_id  uuid not null references tax_filing_periods(id) on delete cascade,
  file_name         text not null,
  file_path         text not null,
  uploaded_at       timestamptz not null default now()
);

create index if not exists idx_tax_filing_documents_period
  on tax_filing_documents (filing_period_id);

-- =============================================
-- 5. Row Level Security
-- =============================================

alter table dealership_tax_settings enable row level security;
alter table tax_filing_periods enable row level security;
alter table filing_period_deals enable row level security;
alter table tax_filing_documents enable row level security;

-- dealership_tax_settings

drop policy if exists "dealership_select_tax_settings" on dealership_tax_settings;
create policy "dealership_select_tax_settings" on dealership_tax_settings
  for select using (dealership_id = auth_user_dealership_id());

drop policy if exists "dealership_insert_tax_settings" on dealership_tax_settings;
create policy "dealership_insert_tax_settings" on dealership_tax_settings
  for insert with check (dealership_id = auth_user_dealership_id());

drop policy if exists "dealership_update_tax_settings" on dealership_tax_settings;
create policy "dealership_update_tax_settings" on dealership_tax_settings
  for update using (dealership_id = auth_user_dealership_id());

-- tax_filing_periods

drop policy if exists "dealership_select_filing_periods" on tax_filing_periods;
create policy "dealership_select_filing_periods" on tax_filing_periods
  for select using (dealership_id = auth_user_dealership_id());

drop policy if exists "dealership_insert_filing_periods" on tax_filing_periods;
create policy "dealership_insert_filing_periods" on tax_filing_periods
  for insert with check (dealership_id = auth_user_dealership_id());

drop policy if exists "dealership_update_filing_periods" on tax_filing_periods;
create policy "dealership_update_filing_periods" on tax_filing_periods
  for update using (dealership_id = auth_user_dealership_id());

drop policy if exists "dealership_delete_filing_periods" on tax_filing_periods;
create policy "dealership_delete_filing_periods" on tax_filing_periods
  for delete using (dealership_id = auth_user_dealership_id());

-- filing_period_deals (access via filing_period relationship)

drop policy if exists "dealership_select_period_deals" on filing_period_deals;
create policy "dealership_select_period_deals" on filing_period_deals
  for select using (
    exists (
      select 1 from tax_filing_periods fp
      where fp.id = filing_period_id
        and fp.dealership_id = auth_user_dealership_id()
    )
  );

drop policy if exists "dealership_insert_period_deals" on filing_period_deals;
create policy "dealership_insert_period_deals" on filing_period_deals
  for insert with check (
    exists (
      select 1 from tax_filing_periods fp
      where fp.id = filing_period_id
        and fp.dealership_id = auth_user_dealership_id()
    )
  );

drop policy if exists "dealership_delete_period_deals" on filing_period_deals;
create policy "dealership_delete_period_deals" on filing_period_deals
  for delete using (
    exists (
      select 1 from tax_filing_periods fp
      where fp.id = filing_period_id
        and fp.dealership_id = auth_user_dealership_id()
    )
  );

-- tax_filing_documents (access via filing_period relationship)

drop policy if exists "dealership_select_filing_docs" on tax_filing_documents;
create policy "dealership_select_filing_docs" on tax_filing_documents
  for select using (
    exists (
      select 1 from tax_filing_periods fp
      where fp.id = filing_period_id
        and fp.dealership_id = auth_user_dealership_id()
    )
  );

drop policy if exists "dealership_insert_filing_docs" on tax_filing_documents;
create policy "dealership_insert_filing_docs" on tax_filing_documents
  for insert with check (
    exists (
      select 1 from tax_filing_periods fp
      where fp.id = filing_period_id
        and fp.dealership_id = auth_user_dealership_id()
    )
  );

drop policy if exists "dealership_delete_filing_docs" on tax_filing_documents;
create policy "dealership_delete_filing_docs" on tax_filing_documents
  for delete using (
    exists (
      select 1 from tax_filing_periods fp
      where fp.id = filing_period_id
        and fp.dealership_id = auth_user_dealership_id()
    )
  );

-- =============================================
-- 6. Supabase Storage bucket
-- =============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tax-filings',
  'tax-filings',
  false,
  20971520,
  '{ "application/pdf", "image/jpeg", "image/png" }'
)
on conflict (id) do nothing;

drop policy if exists "read tax filings" on storage.objects;
create policy "read tax filings"
  on storage.objects for select using (
    bucket_id = 'tax-filings'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
  );

drop policy if exists "insert tax filings" on storage.objects;
create policy "insert tax filings"
  on storage.objects for insert with check (
    bucket_id = 'tax-filings'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
  );

drop policy if exists "delete tax filings" on storage.objects;
create policy "delete tax filings"
  on storage.objects for delete using (
    bucket_id = 'tax-filings'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
  );
