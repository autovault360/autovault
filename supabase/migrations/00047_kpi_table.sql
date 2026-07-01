create table if not exists kpi_table (
  id uuid primary key default gen_random_uuid(),
  dealership_id uuid not null references dealerships(id) on delete cascade,
  page_key text not null,
  kpi_key text not null,
  color_hex text not null check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  column_key text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index if not exists ux_kpi_table_dealership_page_kpi
  on kpi_table (dealership_id, page_key, kpi_key)
  where deleted_at is null;

create index if not exists idx_kpi_table_dealership_page
  on kpi_table (dealership_id, page_key)
  where deleted_at is null;

alter table kpi_table enable row level security;

create policy "kpi_table_select"
  on kpi_table for select
  using (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager', 'cpa', 'sales_rep')
  );

create policy "kpi_table_insert"
  on kpi_table for insert
  with check (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager')
  );

create policy "kpi_table_update"
  on kpi_table for update
  using (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager')
  );

create policy "kpi_table_delete"
  on kpi_table for delete
  using (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager')
  );

create trigger trigger_kpi_table_updated_at
  before update on kpi_table
  for each row
  execute function update_updated_at_column();
