-- Vehicle Purchase Fees: Registration Fees & Auction Fees
-- Adds new fee columns to vehicles table and updates the financial recalculation RPC

-- =============================================
-- 1. Add new columns to vehicles table
-- =============================================

alter table if exists vehicles
  add column if not exists registration_fees numeric(12,2) not null default 0,
  add column if not exists auction_fees numeric(12,2) not null default 0,
  add column if not exists wholesale_registration_fees numeric(12,2) not null default 0;

-- =============================================
-- 2. Add indexes for filtering/sorting on new fee columns
-- =============================================

create index if not exists idx_vehicles_registration_fees
  on vehicles (dealership_id, registration_fees) where deleted_at is null;

create index if not exists idx_vehicles_auction_fees
  on vehicles (dealership_id, auction_fees) where deleted_at is null;

create index if not exists idx_vehicles_wholesale_registration_fees
  on vehicles (dealership_id, wholesale_registration_fees) where deleted_at is null;

-- =============================================
-- 3. Update the RPC function to include new fees in total_invested calculation
-- =============================================

create or replace function update_vehicle_financials(p_vehicle_id uuid)
returns void as $$
declare
  v_acquisition_cost numeric(12,2);
  v_registration_fees numeric(12,2);
  v_auction_fees numeric(12,2);
  v_reconditioning_cost numeric(12,2);
begin
  select acquisition_cost, registration_fees, auction_fees
  into v_acquisition_cost, v_registration_fees, v_auction_fees
  from vehicles where id = p_vehicle_id;

  select coalesce(sum(total_cost), 0) into v_reconditioning_cost
  from vehicle_expenses
  where vehicle_id = p_vehicle_id and deleted_at is null;

  update vehicles
  set
    reconditioning_cost = v_reconditioning_cost,
    total_invested = coalesce(v_acquisition_cost, 0) + coalesce(v_registration_fees, 0) + coalesce(v_auction_fees, 0) + v_reconditioning_cost
  where id = p_vehicle_id;
end;
$$ language plpgsql;