-- AutoVault360 Customer Images
-- Adds profile image support to customers

-- =============================================
-- 1. Add image_url column
-- =============================================

alter table customers
  add column if not exists image_url text;

-- =============================================
-- 2. Create storage bucket
-- =============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customer-images', 'customer-images', false, 5242880, '{ "image/jpeg", "image/png" }')
on conflict (id) do nothing;

-- =============================================
-- 3. RLS policies for customer-images bucket
-- =============================================

drop policy if exists "read own dealership customer images" on storage.objects;
create policy "read own dealership customer images"
  on storage.objects for select using (
    bucket_id = 'customer-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "upload own dealership customer images" on storage.objects;
create policy "upload own dealership customer images"
  on storage.objects for insert with check (
    bucket_id = 'customer-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );

drop policy if exists "delete own dealership customer images" on storage.objects;
create policy "delete own dealership customer images"
  on storage.objects for delete using (
    bucket_id = 'customer-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] in (
      select dealership_id::text from users where auth_user_id = auth.uid()
    )
  );
