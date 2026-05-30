-- AutoVault360 Expenses Module
-- dealership_expenses (general + recurring), vehicle_expenses extensions, receipt storage

-- =============================================
-- 1. ENUMs
-- =============================================

do $$ begin
  create type dealership_expense_category as enum (
    'advertising',
    'accounting',
    'office',
    'salary_wages',
    'other',
    'software',
    'utilities',
    'rent',
    'insurance'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type expense_recurrence_frequency as enum (
    'weekly',
    'monthly',
    'quarterly',
    'yearly'
  );
exception
  when duplicate_object then null;
end $$;

-- =============================================
-- 2. dealership_expenses table
-- =============================================

create table if not exists dealership_expenses (
  id                      uuid primary key default gen_random_uuid(),
  dealership_id           uuid not null references dealerships(id),
  expense_date            date not null,
  category                dealership_expense_category not null,
  vendor                  text not null,
  description             text not null,
  amount                  numeric(12,2) not null,
  reference_number        text,
  payment_method          text,
  tax_deductible          boolean not null default true,
  is_recurring            boolean not null default false,
  recurrence_frequency    expense_recurrence_frequency,
  recurrence_next_due_date date,
  receipt_storage_path    text,
  notes                   text,
  save_merchant           boolean not null default false,
  created_by              uuid not null references users(id),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz
);

create index if not exists idx_dealership_expenses_dealership_date
  on dealership_expenses (dealership_id, expense_date desc)
  where deleted_at is null;

create index if not exists idx_dealership_expenses_dealership_category
  on dealership_expenses (dealership_id, category)
  where deleted_at is null;

create index if not exists idx_dealership_expenses_dealership_recurring
  on dealership_expenses (dealership_id, is_recurring)
  where deleted_at is null;

-- =============================================
-- 3. Extend vehicle_expenses
-- =============================================

alter table vehicle_expenses
  add column if not exists receipt_storage_path text,
  add column if not exists expense_subcategory text,
  add column if not exists source text not null default 'repair_modal';

-- =============================================
-- 4. RLS for dealership_expenses
-- =============================================

alter table dealership_expenses enable row level security;

drop policy if exists "read own dealership dealership_expenses" on dealership_expenses;
create policy "read own dealership dealership_expenses" on dealership_expenses
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "insert dealership_expenses" on dealership_expenses;
create policy "insert dealership_expenses" on dealership_expenses
  for insert with check (
    dealership_id = auth_user_dealership_id()
  );

drop policy if exists "update dealership_expenses" on dealership_expenses;
create policy "update dealership_expenses" on dealership_expenses
  for update using (
    dealership_id = auth_user_dealership_id()
  );

-- =============================================
-- 5. Trigger: recalc vehicle financials on expense changes
-- =============================================

create or replace function trigger_vehicle_expense_financials()
returns trigger as $$
declare
  v_vehicle_id uuid;
begin
  if TG_OP = 'DELETE' then
    v_vehicle_id := OLD.vehicle_id;
  else
    v_vehicle_id := NEW.vehicle_id;
  end if;

  if TG_OP = 'UPDATE' then
    if NEW.deleted_at is distinct from OLD.deleted_at
       or NEW.total_cost is distinct from OLD.total_cost
       or NEW.vehicle_id is distinct from OLD.vehicle_id then
      perform update_vehicle_financials(v_vehicle_id);
      if OLD.vehicle_id is distinct from NEW.vehicle_id then
        perform update_vehicle_financials(OLD.vehicle_id);
      end if;
    end if;
    return NEW;
  elsif TG_OP = 'INSERT' then
    perform update_vehicle_financials(NEW.vehicle_id);
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform update_vehicle_financials(OLD.vehicle_id);
    return OLD;
  end if;

  return null;
end;
$$ language plpgsql;

drop trigger if exists vehicle_expenses_financials on vehicle_expenses;
create trigger vehicle_expenses_financials
  after insert or update or delete on vehicle_expenses
  for each row execute function trigger_vehicle_expense_financials();

-- updated_at on dealership_expenses
drop trigger if exists set_dealership_expenses_updated_at on dealership_expenses;
create trigger set_dealership_expenses_updated_at
  before update on dealership_expenses
  for each row execute function set_updated_at();

-- =============================================
-- 6. expense-receipts storage bucket
-- =============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expense-receipts',
  'expense-receipts',
  false,
  10485760,
  '{ "image/jpeg", "image/png", "application/pdf" }'
)
on conflict (id) do nothing;

drop policy if exists "read own dealership expense receipts" on storage.objects;
create policy "read own dealership expense receipts"
  on storage.objects for select using (
    bucket_id = 'expense-receipts'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "upload own dealership expense receipts" on storage.objects;
create policy "upload own dealership expense receipts"
  on storage.objects for insert with check (
    bucket_id = 'expense-receipts'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "delete own dealership expense receipts" on storage.objects;
create policy "delete own dealership expense receipts"
  on storage.objects for delete using (
    bucket_id = 'expense-receipts'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );
