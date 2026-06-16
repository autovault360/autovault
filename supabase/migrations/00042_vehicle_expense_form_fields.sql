-- Vehicle expense form parity fields
-- Used by both admin and wholesale add vehicle expense flows.

alter table vehicle_expenses
  add column if not exists expense_name text,
  add column if not exists vehicle_notes_amount numeric(12,2) not null default 0;

create index if not exists idx_vehicle_expenses_expense_name
  on vehicle_expenses (dealership_id, expense_name)
  where deleted_at is null;
