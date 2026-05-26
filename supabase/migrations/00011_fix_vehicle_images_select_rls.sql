-- Fix "new row violates row-level security policy" error when soft-deleting vehicle_images.
-- The SELECT policy with `deleted_at is null` causes PostgREST to reject the UPDATE
-- because the updated row (with deleted_at set) no longer satisfies the SELECT policy.
-- 
-- Fix: Remove `deleted_at is null` from the SELECT policy. Deleted images are filtered
-- at the query level instead.

drop policy if exists "read own dealership images" on vehicle_images;
create policy "read own dealership images" on vehicle_images
  for select using (
    dealership_id = auth_user_dealership_id()
  );
