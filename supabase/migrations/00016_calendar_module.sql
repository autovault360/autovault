-- Calendar module: deal_jackets (if missing), calendar_events, calendar_day_notes

-- =============================================
-- 1. deal_jackets
-- =============================================

create table if not exists deal_jackets (
  id                  uuid primary key default gen_random_uuid(),
  dealership_id       uuid not null references dealerships(id),
  deal_id             uuid references deals(id),
  vehicle_id          uuid not null references vehicles(id),
  customer_id         uuid not null references customers(id),
  sales_rep_id        uuid references users(id),
  jacket_number       text not null,
  sold_price          numeric(12,2) not null default 0,
  total_tax           numeric(12,2) not null default 0,
  fees                jsonb not null default '{}',
  total_sale_price    numeric(12,2) not null default 0,
  down_payment        numeric(12,2) not null default 0,
  amount_financed     numeric(12,2) not null default 0,
  balance_due           numeric(12,2) not null default 0,
  total_invested      numeric(12,2) not null default 0,
  additional_expenses numeric(12,2) not null default 0,
  commission_amount   numeric(12,2) not null default 0,
  commission_status   text not null default 'pending' check (commission_status in ('pending', 'paid')),
  profit_gross        numeric(12,2) not null default 0,
  profit_net          numeric(12,2) not null default 0,
  date_sold           timestamptz not null,
  created_by          uuid references users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz,
  unique (vehicle_id)
);

create index if not exists idx_deal_jackets_dealership_date
  on deal_jackets (dealership_id, date_sold)
  where deleted_at is null;

create index if not exists idx_deal_jackets_sales_rep
  on deal_jackets (sales_rep_id)
  where deleted_at is null;

-- =============================================
-- 2. deal_jacket_documents
-- =============================================

create table if not exists deal_jacket_documents (
  id              uuid primary key default gen_random_uuid(),
  deal_jacket_id  uuid not null references deal_jackets(id) on delete cascade,
  file_url        text not null,
  file_type       text not null default 'application/pdf',
  document_name   text not null,
  uploaded_at     timestamptz not null default now()
);

create index if not exists idx_deal_jacket_documents_jacket
  on deal_jacket_documents (deal_jacket_id);

-- =============================================
-- 3. calendar_events
-- =============================================

do $$ begin
  create type calendar_event_type as enum (
    'compliance',
    'appointment',
    'payroll',
    'follow_up',
    'task'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists calendar_events (
  id              uuid primary key default gen_random_uuid(),
  dealership_id   uuid not null references dealerships(id),
  event_date      date not null,
  event_time      time,
  title           text not null,
  event_type      calendar_event_type not null default 'task',
  description     text,
  source_module   text,
  source_id       uuid,
  created_by      uuid references users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create index if not exists idx_calendar_events_dealership_date
  on calendar_events (dealership_id, event_date)
  where deleted_at is null;

-- =============================================
-- 4. calendar_day_notes
-- =============================================

create table if not exists calendar_day_notes (
  id              uuid primary key default gen_random_uuid(),
  dealership_id   uuid not null references dealerships(id),
  note_date       date not null,
  body            text not null default '',
  updated_by      uuid references users(id),
  updated_at      timestamptz not null default now(),
  unique (dealership_id, note_date)
);

create index if not exists idx_calendar_day_notes_dealership_date
  on calendar_day_notes (dealership_id, note_date);

-- =============================================
-- 5. Row Level Security
-- =============================================

alter table deal_jackets enable row level security;
alter table deal_jacket_documents enable row level security;
alter table calendar_events enable row level security;
alter table calendar_day_notes enable row level security;

drop policy if exists "read own dealership deal_jackets" on deal_jackets;
create policy "read own dealership deal_jackets" on deal_jackets
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "insert deal_jackets" on deal_jackets;
create policy "insert deal_jackets" on deal_jackets
  for insert with check (dealership_id = auth_user_dealership_id());

drop policy if exists "update deal_jackets" on deal_jackets;
create policy "update deal_jackets" on deal_jackets
  for update using (dealership_id = auth_user_dealership_id());

drop policy if exists "read own dealership deal_jacket_documents" on deal_jacket_documents;
create policy "read own dealership deal_jacket_documents" on deal_jacket_documents
  for select using (
    exists (
      select 1 from deal_jackets dj
      where dj.id = deal_jacket_id
        and dj.dealership_id = auth_user_dealership_id()
        and dj.deleted_at is null
    )
  );

drop policy if exists "insert deal_jacket_documents" on deal_jacket_documents;
create policy "insert deal_jacket_documents" on deal_jacket_documents
  for insert with check (
    exists (
      select 1 from deal_jackets dj
      where dj.id = deal_jacket_id
        and dj.dealership_id = auth_user_dealership_id()
    )
  );

drop policy if exists "read own dealership calendar_events" on calendar_events;
create policy "read own dealership calendar_events" on calendar_events
  for select using (
    dealership_id = auth_user_dealership_id() and deleted_at is null
  );

drop policy if exists "insert calendar_events" on calendar_events;
create policy "insert calendar_events" on calendar_events
  for insert with check (dealership_id = auth_user_dealership_id());

drop policy if exists "update calendar_events" on calendar_events;
create policy "update calendar_events" on calendar_events
  for update using (dealership_id = auth_user_dealership_id());

drop policy if exists "read own dealership calendar_day_notes" on calendar_day_notes;
create policy "read own dealership calendar_day_notes" on calendar_day_notes
  for select using (dealership_id = auth_user_dealership_id());

drop policy if exists "insert calendar_day_notes" on calendar_day_notes;
create policy "insert calendar_day_notes" on calendar_day_notes
  for insert with check (dealership_id = auth_user_dealership_id());

drop policy if exists "update calendar_day_notes" on calendar_day_notes;
create policy "update calendar_day_notes" on calendar_day_notes
  for update using (dealership_id = auth_user_dealership_id());
