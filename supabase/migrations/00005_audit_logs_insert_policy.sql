-- AutoVault360 — Allow authenticated users to insert audit logs
-- The audit_logs table had RLS enabled but no INSERT policy,
-- so all inserts from server actions (anon key) were silently rejected.

drop policy if exists "insert audit logs" on audit_logs;

create policy "insert audit logs" on audit_logs
  for insert with check (
    dealership_id = auth_user_dealership_id()
  );
