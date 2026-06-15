-- Arbitration fields on vehicles + internal team notes table

alter table vehicles
  add column if not exists arbitration_reason text,
  add column if not exists arbitration_listed_at date,
  add column if not exists arbitration_buyer_dealer text;

create index if not exists idx_vehicles_arbitration
  on vehicles (dealership_id, status)
  where status = 'arbitration' and deleted_at is null;

create table if not exists arbitration_notes (
  id              uuid primary key default gen_random_uuid(),
  vehicle_id      uuid not null references vehicles(id) on delete cascade,
  dealership_id   uuid not null references dealerships(id) on delete cascade,
  author_id       uuid not null references users(id),
  author_name     text not null,
  body            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_arbitration_notes_vehicle
  on arbitration_notes (vehicle_id, created_at desc);

create index if not exists idx_arbitration_notes_dealership
  on arbitration_notes (dealership_id);

alter table arbitration_notes enable row level security;

drop policy if exists "arbitration_notes_select_dealership" on arbitration_notes;
create policy "arbitration_notes_select_dealership"
  on arbitration_notes for select
  using (dealership_id = auth_user_dealership_id());

drop policy if exists "arbitration_notes_insert_dealership" on arbitration_notes;
create policy "arbitration_notes_insert_dealership"
  on arbitration_notes for insert
  with check (
    dealership_id = auth_user_dealership_id()
    and author_id = (
      select id from users where auth_user_id = auth.uid() limit 1
    )
  );
