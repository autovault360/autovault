-- Flooring plans: configurable floor-plan financing rules per dealership

create table if not exists flooring_plans (
  id                      uuid primary key default gen_random_uuid(),
  dealership_id           uuid not null references dealerships(id) on delete cascade,
  name                    text not null default 'Standard Floor Plan',
  rate_type               text not null default 'monthly'
    check (rate_type in ('monthly', 'daily', 'apr')),
  base_rate               numeric(12,4) not null,
  effective_date          date not null,
  rate_increase_enabled   boolean not null default false,
  increase_after_days     integer,
  increase_amount_type    text check (increase_amount_type is null or increase_amount_type in ('fixed', 'percentage')),
  increase_amount         numeric(12,2),
  max_cap                 numeric(12,2),
  buy_fee                 numeric(12,2) not null default 0,
  late_fee_after_days     integer,
  late_fee_per_day        numeric(12,2) not null default 0,
  grace_period_days       integer not null default 0,
  is_active               boolean not null default true,
  created_by              uuid references users(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz
);

create index if not exists idx_flooring_plans_dealership
  on flooring_plans (dealership_id) where deleted_at is null;

alter table if exists vehicles
  add column if not exists flooring_plan_id uuid references flooring_plans(id),
  add column if not exists flooring_start_date date;

create index if not exists idx_vehicles_flooring_plan
  on vehicles (dealership_id, flooring_plan_id) where deleted_at is null;

alter table flooring_plans enable row level security;

create policy "flooring_plans_select"
  on flooring_plans for select
  using (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager', 'cpa', 'sales_rep')
  );

create policy "flooring_plans_insert"
  on flooring_plans for insert
  with check (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager')
  );

create policy "flooring_plans_update"
  on flooring_plans for update
  using (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager')
  );

create policy "flooring_plans_delete"
  on flooring_plans for delete
  using (
    dealership_id = public.auth_user_dealership_id()
    and public.auth_user_role() in ('super_admin', 'owner', 'manager')
  );

create trigger trigger_flooring_plans_updated_at
  before update on flooring_plans
  for each row
  execute function update_updated_at_column();
