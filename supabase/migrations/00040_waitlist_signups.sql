-- Platform waitlist signups from public landing page

create table if not exists waitlist_signups (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  full_name       text,
  phone           text,
  dealership_name text,
  source          text not null default 'landing_page'
    check (source in ('hero_form', 'footer_form', 'landing_page')),
  status          text not null default 'pending'
    check (status in ('pending', 'contacted', 'converted', 'unsubscribed')),
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists idx_waitlist_email_unique
  on waitlist_signups (lower(email));

create index if not exists idx_waitlist_status_created
  on waitlist_signups (status, created_at desc);

alter table waitlist_signups enable row level security;

drop policy if exists "waitlist_service_role" on waitlist_signups;
create policy "waitlist_service_role"
  on waitlist_signups for all
  using (auth.role() = 'service_role');

drop policy if exists "waitlist_super_admin_select" on waitlist_signups;
create policy "waitlist_super_admin_select"
  on waitlist_signups for select
  using (public.is_super_admin());
