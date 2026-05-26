-- Allow soft-deleting vehicle_images (setting deleted_at) via UPDATE.
-- Without an explicit WITH CHECK clause, updates that set deleted_at can fail RLS.

drop policy if exists "update images" on vehicle_images;
create policy "update images" on vehicle_images
  for update using (
    dealership_id = auth_user_dealership_id()
  ) with check (
    dealership_id = auth_user_dealership_id()
  );
