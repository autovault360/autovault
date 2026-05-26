-- Sales rep profile fields on users + avatar storage

alter table users
  add column if not exists phone text,
  add column if not exists image_url text,
  add column if not exists address text,
  add column if not exists address2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip text,
  add column if not exists hire_date date,
  add column if not exists commission_rate numeric(5,4) not null default 0.1000,
  add column if not exists monthly_goal numeric(12,2) not null default 50000;

create unique index if not exists idx_users_dealership_email
  on users (dealership_id, lower(email))
  where dealership_id is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-images', 'user-images', false, 5242880, '{ "image/jpeg", "image/png" }')
on conflict (id) do nothing;

drop policy if exists "read own dealership user images" on storage.objects;
create policy "read own dealership user images"
  on storage.objects for select using (
    bucket_id = 'user-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "upload own dealership user images" on storage.objects;
create policy "upload own dealership user images"
  on storage.objects for insert with check (
    bucket_id = 'user-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "delete own dealership user images" on storage.objects;
create policy "delete own dealership user images"
  on storage.objects for delete using (
    bucket_id = 'user-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "Dealership managers can update coworker profiles" on users;
create policy "Dealership managers can update coworker profiles"
  on users for update
  using (
    dealership_id = auth_user_dealership_id()
    and auth_user_role() in ('owner', 'manager', 'super_admin')
  )
  with check (
    dealership_id = auth_user_dealership_id()
    and role in ('sales_rep', 'manager', 'owner', 'cpa')
  );
