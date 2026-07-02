-- Replace partial unique index (not compatible with ON CONFLICT) with a table constraint.
drop index if exists ux_kpi_table_dealership_page_kpi;

delete from kpi_table where deleted_at is not null;

alter table kpi_table
  drop constraint if exists uq_kpi_table_dealership_page_kpi;

alter table kpi_table
  add constraint uq_kpi_table_dealership_page_kpi
  unique (dealership_id, page_key, kpi_key);