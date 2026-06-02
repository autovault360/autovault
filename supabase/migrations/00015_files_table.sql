-- AutoVault360 Unified Files Registry
-- Tracks every file uploaded across all modules
-- Enables the Files & Storage dashboard with real data

-- =============================================
-- 1. files table (unified file registry)
-- =============================================

create table if not exists files (
  id              uuid primary key default gen_random_uuid(),
  dealership_id   uuid not null references dealerships(id) on delete cascade,

  -- storage info
  bucket          text not null,
  storage_path    text not null,

  -- original file metadata
  original_name   text not null,
  file_size       bigint not null,
  mime_type       text not null,
  file_type       text not null,  -- normalized: 'pdf', 'jpg', 'png', 'xlsx', 'mp4', 'webp', 'other'

  -- polymorphic link to source record
  source_entity    text,          -- 'vehicle', 'customer', 'deal', 'expense', 'deal_jacket', 'dealership_expense', 'user'
  source_entity_id uuid,          -- id of the linked record

  uploaded_by     uuid not null references users(id),
  uploaded_at     timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists idx_files_dealership on files(dealership_id);
create index if not exists idx_files_source on files(source_entity, source_entity_id);
create index if not exists idx_files_uploaded_at on files(dealership_id, uploaded_at desc);
create index if not exists idx_files_bucket on files(dealership_id, bucket);
create index if not exists idx_files_file_type on files(dealership_id, file_type);

-- Enable RLS
alter table files enable row level security;

-- RLS: dealership isolation
create policy files_dealership_isolation on files
  for all
  using (dealership_id = auth_user_dealership_id());

-- RLS: service role bypass (via the helper function)
create policy files_service_role on files
  for all
  using (auth.role() = 'service_role');
