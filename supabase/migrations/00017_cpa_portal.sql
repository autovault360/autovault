-- AutoVault360 CPA Portal
-- Profiles, notes, comments, attachments, activity, storage

-- =============================================
-- 1. Helper functions
-- =============================================

create or replace function public.can_access_cpa_portal()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth_user_role() in ('super_admin', 'owner', 'manager', 'cpa'),
    false
  );
$$;

create or replace function public.can_manage_cpa_notes()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    auth_user_role() in ('super_admin', 'owner', 'manager'),
    false
  );
$$;

-- =============================================
-- 2. cpa_profiles
-- =============================================

create table if not exists cpa_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references users(id) on delete cascade,
  first_name  varchar(100),
  last_name   varchar(100),
  status      varchar(50) not null default 'PENDING'
    check (status in ('PENDING', 'ACTIVE', 'DISABLED')),
  last_login  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_cpa_profiles_user on cpa_profiles(user_id);
create index if not exists idx_cpa_profiles_status on cpa_profiles(status);

drop trigger if exists set_updated_at_cpa_profiles on cpa_profiles;
create trigger set_updated_at_cpa_profiles
  before update on cpa_profiles
  for each row execute function update_updated_at_column();

-- =============================================
-- 3. cpa_notes
-- =============================================

create table if not exists cpa_notes (
  id              uuid primary key default gen_random_uuid(),
  title           varchar(255) not null,
  description     text not null default '',
  category        varchar(100) not null default 'General'
    check (category in (
      'Documents', 'Receipts', 'Payroll', 'Sales Tax',
      'Deal Jackets', 'Audit', 'Vehicle Records', 'General'
    )),
  priority        varchar(50) not null default 'MEDIUM'
    check (priority in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status          varchar(50) not null default 'OPEN'
    check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED')),
  created_by      uuid not null references users(id),
  assigned_to     uuid references users(id),
  dealership_id   uuid not null references dealerships(id) on delete cascade,
  stock_number    varchar(100),
  vehicle_id      uuid references vehicles(id) on delete set null,
  is_archived     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  resolved_at     timestamptz
);

create index if not exists idx_cpa_notes_dealership on cpa_notes(dealership_id, created_at desc);
create index if not exists idx_cpa_notes_status on cpa_notes(dealership_id, status) where not is_archived;
create index if not exists idx_cpa_notes_stock on cpa_notes(dealership_id, stock_number) where stock_number is not null;

drop trigger if exists set_updated_at_cpa_notes on cpa_notes;
create trigger set_updated_at_cpa_notes
  before update on cpa_notes
  for each row execute function update_updated_at_column();

-- =============================================
-- 4. cpa_note_comments
-- =============================================

create table if not exists cpa_note_comments (
  id          uuid primary key default gen_random_uuid(),
  note_id     uuid not null references cpa_notes(id) on delete cascade,
  user_id     uuid not null references users(id),
  comment     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_cpa_note_comments_note on cpa_note_comments(note_id, created_at asc);

drop trigger if exists set_updated_at_cpa_note_comments on cpa_note_comments;
create trigger set_updated_at_cpa_note_comments
  before update on cpa_note_comments
  for each row execute function update_updated_at_column();

-- =============================================
-- 5. cpa_note_attachments
-- =============================================

create table if not exists cpa_note_attachments (
  id          uuid primary key default gen_random_uuid(),
  note_id     uuid not null references cpa_notes(id) on delete cascade,
  uploaded_by uuid not null references users(id),
  file_name   varchar(255) not null,
  file_url    text not null,
  file_size   bigint not null default 0,
  mime_type   varchar(255),
  created_at  timestamptz not null default now()
);

create index if not exists idx_cpa_note_attachments_note on cpa_note_attachments(note_id);

-- =============================================
-- 6. cpa_note_activity
-- =============================================

create table if not exists cpa_note_activity (
  id                    uuid primary key default gen_random_uuid(),
  note_id               uuid not null references cpa_notes(id) on delete cascade,
  user_id               uuid not null references users(id),
  activity_type         varchar(100) not null,
  activity_description  text not null,
  created_at            timestamptz not null default now()
);

create index if not exists idx_cpa_note_activity_note on cpa_note_activity(note_id, created_at asc);

-- =============================================
-- 7. RLS
-- =============================================

alter table cpa_profiles enable row level security;
alter table cpa_notes enable row level security;
alter table cpa_note_comments enable row level security;
alter table cpa_note_attachments enable row level security;
alter table cpa_note_activity enable row level security;

-- cpa_profiles
drop policy if exists "cpa profiles select own dealership" on cpa_profiles;
create policy "cpa profiles select own dealership"
  on cpa_profiles for select
  using (
    exists (
      select 1 from users u
      where u.id = cpa_profiles.user_id
        and u.dealership_id = auth_user_dealership_id()
    )
    or is_super_admin()
  );

drop policy if exists "cpa profiles manage admins" on cpa_profiles;
create policy "cpa profiles manage admins"
  on cpa_profiles for all
  using (can_manage_cpa_notes() or is_super_admin())
  with check (can_manage_cpa_notes() or is_super_admin());

-- cpa_notes
drop policy if exists "cpa notes select dealership" on cpa_notes;
create policy "cpa notes select dealership"
  on cpa_notes for select
  using (
    dealership_id = auth_user_dealership_id()
    and can_access_cpa_portal()
  );

drop policy if exists "cpa notes insert" on cpa_notes;
create policy "cpa notes insert"
  on cpa_notes for insert
  with check (
    dealership_id = auth_user_dealership_id()
    and can_access_cpa_portal()
    and created_by = (select id from users where auth_user_id = auth.uid())
  );

drop policy if exists "cpa notes update" on cpa_notes;
create policy "cpa notes update"
  on cpa_notes for update
  using (
    dealership_id = auth_user_dealership_id()
    and can_access_cpa_portal()
    and (
      can_manage_cpa_notes()
      or (
        auth_user_role() = 'cpa'
        and created_by = (select id from users where auth_user_id = auth.uid())
      )
    )
  );

-- cpa_note_comments
drop policy if exists "cpa comments select" on cpa_note_comments;
create policy "cpa comments select"
  on cpa_note_comments for select
  using (
    exists (
      select 1 from cpa_notes n
      where n.id = cpa_note_comments.note_id
        and n.dealership_id = auth_user_dealership_id()
    )
    and can_access_cpa_portal()
  );

drop policy if exists "cpa comments insert" on cpa_note_comments;
create policy "cpa comments insert"
  on cpa_note_comments for insert
  with check (
    exists (
      select 1 from cpa_notes n
      where n.id = cpa_note_comments.note_id
        and n.dealership_id = auth_user_dealership_id()
    )
    and can_access_cpa_portal()
    and user_id = (select id from users where auth_user_id = auth.uid())
  );

-- cpa_note_attachments
drop policy if exists "cpa attachments select" on cpa_note_attachments;
create policy "cpa attachments select"
  on cpa_note_attachments for select
  using (
    exists (
      select 1 from cpa_notes n
      where n.id = cpa_note_attachments.note_id
        and n.dealership_id = auth_user_dealership_id()
    )
    and can_access_cpa_portal()
  );

drop policy if exists "cpa attachments insert" on cpa_note_attachments;
create policy "cpa attachments insert"
  on cpa_note_attachments for insert
  with check (
    exists (
      select 1 from cpa_notes n
      where n.id = cpa_note_attachments.note_id
        and n.dealership_id = auth_user_dealership_id()
    )
    and can_access_cpa_portal()
    and uploaded_by = (select id from users where auth_user_id = auth.uid())
  );

drop policy if exists "cpa attachments delete admins" on cpa_note_attachments;
create policy "cpa attachments delete admins"
  on cpa_note_attachments for delete
  using (can_manage_cpa_notes() or is_super_admin());

-- cpa_note_activity
drop policy if exists "cpa activity select" on cpa_note_activity;
create policy "cpa activity select"
  on cpa_note_activity for select
  using (
    exists (
      select 1 from cpa_notes n
      where n.id = cpa_note_activity.note_id
        and n.dealership_id = auth_user_dealership_id()
    )
    and can_access_cpa_portal()
  );

drop policy if exists "cpa activity insert" on cpa_note_activity;
create policy "cpa activity insert"
  on cpa_note_activity for insert
  with check (
    exists (
      select 1 from cpa_notes n
      where n.id = cpa_note_activity.note_id
        and n.dealership_id = auth_user_dealership_id()
    )
    and can_access_cpa_portal()
    and user_id = (select id from users where auth_user_id = auth.uid())
  );

-- =============================================
-- 8. Storage bucket
-- =============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cpa-note-attachments',
  'cpa-note-attachments',
  false,
  20971520,
  '{ "application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }'
)
on conflict (id) do nothing;

drop policy if exists "read cpa note attachments" on storage.objects;
create policy "read cpa note attachments"
  on storage.objects for select using (
    bucket_id = 'cpa-note-attachments'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
    and can_access_cpa_portal()
  );

drop policy if exists "upload cpa note attachments" on storage.objects;
create policy "upload cpa note attachments"
  on storage.objects for insert with check (
    bucket_id = 'cpa-note-attachments'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
    and can_access_cpa_portal()
  );

drop policy if exists "delete cpa note attachments admins" on storage.objects;
create policy "delete cpa note attachments admins"
  on storage.objects for delete using (
    bucket_id = 'cpa-note-attachments'
    and (can_manage_cpa_notes() or is_super_admin())
  );

-- =============================================
-- 9. Seed sample notes (when dealership + any user exist)
-- =============================================

do $$
declare
  v_dealership_id uuid;
  v_user_id uuid;
begin
  select id into v_dealership_id from dealerships where status = 'active' order by created_at asc limit 1;
  if v_dealership_id is null then
    return;
  end if;

  select id into v_user_id from users
  where dealership_id = v_dealership_id and role in ('owner', 'manager', 'cpa')
  order by case when role = 'cpa' then 0 else 1 end
  limit 1;

  if v_user_id is null then
    select id into v_user_id from users where role = 'super_admin' limit 1;
  end if;

  if v_user_id is null then
    return;
  end if;

  if exists (select 1 from cpa_notes where dealership_id = v_dealership_id limit 1) then
    return;
  end if;

  insert into cpa_notes (title, description, category, priority, status, created_by, dealership_id, stock_number) values
    ('Need receipt for vehicle STK12345', 'Please upload the buyer receipt for the May 12 sale. Required for sales tax filing.', 'Documents', 'HIGH', 'OPEN', v_user_id, v_dealership_id, 'STK12345'),
    ('Payroll tax deposit confirmation', 'Need confirmation of Q2 payroll tax deposit for May payroll run.', 'Payroll', 'MEDIUM', 'IN_PROGRESS', v_user_id, v_dealership_id, null),
    ('Missing odometer statement - STK11892', 'Deal jacket for STK11892 is missing signed odometer disclosure.', 'Deal Jackets', 'HIGH', 'OPEN', v_user_id, v_dealership_id, 'STK11892'),
    ('Sales tax payment proof - April', 'Upload proof of April sales tax payment to CDTFA.', 'Sales Tax', 'URGENT', 'OPEN', v_user_id, v_dealership_id, null),
    ('Unreconciled AMEX charges', 'Three AMEX transactions on May 8-10 need expense categorization.', 'Receipts', 'MEDIUM', 'IN_PROGRESS', v_user_id, v_dealership_id, null),
    ('Annual audit document request', 'Please provide updated floor plan statement for audit readiness.', 'Audit', 'HIGH', 'OPEN', v_user_id, v_dealership_id, null),
    ('Commission report - May', 'May commission spreadsheet needed for payroll reconciliation.', 'Payroll', 'LOW', 'RESOLVED', v_user_id, v_dealership_id, null),
    ('Vehicle title copy STK12001', 'Need copy of title for sold unit STK12001.', 'Vehicle Records', 'MEDIUM', 'RESOLVED', v_user_id, v_dealership_id, 'STK12001');

  insert into cpa_note_activity (note_id, user_id, activity_type, activity_description)
  select id, v_user_id, 'Note Created', 'Note created'
  from cpa_notes where dealership_id = v_dealership_id;
end $$;
