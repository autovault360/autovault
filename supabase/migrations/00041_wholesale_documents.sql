-- Wholesale dealer documents module

create table if not exists wholesale_documents (
  id                  uuid primary key default gen_random_uuid(),
  dealership_id       uuid not null references dealerships(id) on delete cascade,
  wholesale_dealer_id uuid not null references users(id),
  vehicle_id          uuid references vehicles(id) on delete set null,
  document_name       text not null,
  document_type       text not null
    check (document_type in ('vehicle_document', 'dealer_document', 'general')),
  category            text not null,
  description         text,
  original_file_name  text not null,
  stored_file_name    text not null,
  storage_path        text not null,
  mime_type           text not null,
  file_size           bigint not null default 0,
  upload_date         timestamptz not null default now(),
  expiry_date         date,
  status              text not null default 'active'
    check (status in ('active', 'pending_review', 'expired', 'archived')),
  remarks             text,
  uploaded_by         uuid not null references users(id),
  file_id             uuid references files(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create index if not exists idx_wholesale_documents_dealership
  on wholesale_documents (dealership_id, created_at desc)
  where deleted_at is null;

create index if not exists idx_wholesale_documents_vehicle
  on wholesale_documents (vehicle_id)
  where deleted_at is null;

create index if not exists idx_wholesale_documents_status
  on wholesale_documents (dealership_id, status)
  where deleted_at is null;

create index if not exists idx_wholesale_documents_expiry
  on wholesale_documents (dealership_id, expiry_date)
  where deleted_at is null;

drop trigger if exists set_updated_at_wholesale_documents on wholesale_documents;
create trigger set_updated_at_wholesale_documents
  before update on wholesale_documents
  for each row execute function update_updated_at_column();

alter table wholesale_documents enable row level security;

drop policy if exists "wholesale_documents select own dealership" on wholesale_documents;
create policy "wholesale_documents select own dealership"
  on wholesale_documents for select
  using (dealership_id = auth_user_dealership_id());

drop policy if exists "wholesale_documents insert own dealership" on wholesale_documents;
create policy "wholesale_documents insert own dealership"
  on wholesale_documents for insert
  with check (dealership_id = auth_user_dealership_id());

drop policy if exists "wholesale_documents update own dealership" on wholesale_documents;
create policy "wholesale_documents update own dealership"
  on wholesale_documents for update
  using (dealership_id = auth_user_dealership_id());
