-- Wholesale inventory fields on vehicles table

-- Extend vehicle_status enum with pending_sale
do $$ begin
  alter type vehicle_status add value if not exists 'pending_sale';
exception
  when duplicate_object then null;
end $$;

-- Wholesale-specific columns
alter table vehicles
  add column if not exists title_missing_since date,
  add column if not exists wholesale_payment_status text
    check (wholesale_payment_status is null or wholesale_payment_status in ('paid', 'on_hold', 'partial')),
  add column if not exists sold_at date,
  add column if not exists sold_price numeric(12,2),
  add column if not exists times_in_auction integer not null default 0,
  add column if not exists next_auction_date date,
  add column if not exists last_auction_date date,
  add column if not exists condition text
    check (condition is null or condition in ('excellent', 'good', 'fair')),
  add column if not exists wholesale_auction_fees numeric(12,2) not null default 0,
  add column if not exists wholesale_transport_cost numeric(12,2) not null default 0,
  add column if not exists wholesale_storage_cost numeric(12,2) not null default 0,
  add column if not exists wholesale_dealer_fees numeric(12,2) not null default 0;

create index if not exists idx_vehicles_title_missing_since
  on vehicles (dealership_id, title_missing_since)
  where deleted_at is null and title_status = 'missing';

create index if not exists idx_vehicles_sold_at
  on vehicles (dealership_id, sold_at desc)
  where deleted_at is null and status = 'sold';
