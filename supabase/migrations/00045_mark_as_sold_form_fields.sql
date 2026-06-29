-- Mark-as-Sold form redesign: flooring fees, commission, dealer payouts

alter table if exists vehicles
  add column if not exists flooring_fees numeric(12,2) not null default 0;

alter table if exists deals
  add column if not exists sold_price_before_tax numeric(12,2),
  add column if not exists sales_rep_id uuid references users(id),
  add column if not exists commission_type text
    check (commission_type is null or commission_type in ('percentage', 'manual')),
  add column if not exists commission_rate numeric(5,2),
  add column if not exists manual_commission_amount numeric(12,2),
  add column if not exists commission_amount numeric(12,2),
  add column if not exists dealer_payouts_enabled boolean not null default false,
  add column if not exists other_payouts_total numeric(12,2) not null default 0,
  add column if not exists net_profit numeric(12,2),
  add column if not exists roi_percent numeric(6,2);

create index if not exists idx_deals_sales_rep
  on deals (dealership_id, sales_rep_id) where deleted_at is null;

create table if not exists deal_rep_payout_items (
  id              uuid primary key default gen_random_uuid(),
  deal_id         uuid not null references deals(id) on delete cascade,
  dealership_id   uuid not null references dealerships(id),
  description     text not null,
  amount          numeric(12,2) not null default 0,
  frequency       text not null default 'one_time'
    check (frequency in ('one_time', 'weekly', 'monthly', 'per_deal')),
  created_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists idx_deal_rep_payout_items_deal
  on deal_rep_payout_items (deal_id) where deleted_at is null;

alter table deal_rep_payout_items enable row level security;

create policy "deal_rep_payout_items_select"
  on deal_rep_payout_items for select
  using (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager', 'cpa')
  );

create policy "deal_rep_payout_items_insert"
  on deal_rep_payout_items for insert
  with check (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager')
  );

create policy "deal_rep_payout_items_update"
  on deal_rep_payout_items for update
  using (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager')
  );

create policy "deal_rep_payout_items_delete"
  on deal_rep_payout_items for delete
  using (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager')
  );

create or replace function update_vehicle_financials(p_vehicle_id uuid)
returns void as $$
declare
  v_acquisition_cost numeric(12,2);
  v_registration_fees numeric(12,2);
  v_auction_fees numeric(12,2);
  v_flooring_fees numeric(12,2);
  v_reconditioning_cost numeric(12,2);
begin
  select acquisition_cost, registration_fees, auction_fees, flooring_fees
  into v_acquisition_cost, v_registration_fees, v_auction_fees, v_flooring_fees
  from vehicles where id = p_vehicle_id;

  select coalesce(sum(total_cost), 0) into v_reconditioning_cost
  from vehicle_expenses
  where vehicle_id = p_vehicle_id and deleted_at is null;

  update vehicles
  set
    reconditioning_cost = v_reconditioning_cost,
    total_invested = coalesce(v_acquisition_cost, 0)
      + coalesce(v_registration_fees, 0)
      + coalesce(v_auction_fees, 0)
      + coalesce(v_flooring_fees, 0)
      + v_reconditioning_cost
  where id = p_vehicle_id;
end;
$$ language plpgsql;
