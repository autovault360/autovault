-- Replace title_number with title_received (boolean)

alter table vehicles
  add column if not exists title_received boolean not null default true;

-- Backfill from existing title_status / title_missing_since
update vehicles
set title_received = case
  when title_status in ('missing', 'pending') then false
  when title_missing_since is not null then false
  else true
end;

alter table vehicles drop column if exists title_number;

-- Refresh missing titles index to use title_received
drop index if exists idx_vehicles_title_missing_since;

create index if not exists idx_vehicles_title_missing_since
  on vehicles (dealership_id, title_missing_since)
  where deleted_at is null and title_received = false;