-- Super admins are platform users without a fixed dealership_id.
-- Resolve their tenant context from the first active dealership so
-- vehicle RLS and storage policies work during development/testing.

create or replace function auth_user_dealership_id()
returns uuid as $$
  select coalesce(
    (select dealership_id from users where auth_user_id = auth.uid()),
    case
      when (select role from users where auth_user_id = auth.uid()) = 'super_admin'
      then (
        select id
        from dealerships
        where status = 'active'
        order by created_at asc
        limit 1
      )
    end
  );
$$ language sql stable;

-- Storage policies previously queried users.dealership_id directly,
-- which is null for super_admin. Use auth_user_dealership_id() instead.

drop policy if exists "read own dealership images" on storage.objects;
create policy "read own dealership images"
  on storage.objects for select using (
    bucket_id = 'vehicle-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
  );

drop policy if exists "upload own dealership images" on storage.objects;
create policy "upload own dealership images"
  on storage.objects for insert with check (
    bucket_id = 'vehicle-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
  );

drop policy if exists "delete own dealership images" on storage.objects;
create policy "delete own dealership images"
  on storage.objects for delete using (
    bucket_id = 'vehicle-images'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
  );

drop policy if exists "read own dealership documents" on storage.objects;
create policy "read own dealership documents"
  on storage.objects for select using (
    bucket_id = 'vehicle-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
  );

drop policy if exists "upload own dealership documents" on storage.objects;
create policy "upload own dealership documents"
  on storage.objects for insert with check (
    bucket_id = 'vehicle-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
  );

drop policy if exists "delete own dealership documents" on storage.objects;
create policy "delete own dealership documents"
  on storage.objects for delete using (
    bucket_id = 'vehicle-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth_user_dealership_id()::text
  );
