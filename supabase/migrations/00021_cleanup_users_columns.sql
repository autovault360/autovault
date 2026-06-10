-- AutoVault360 — Cleanup: Remove role-specific columns from users table
-- These columns have been migrated to role-specific profile tables:
--   sales_rep_profiles, manager_profiles, wholesale_dealer_profiles, owner_profiles, cpa_profiles
--
-- Kept in users: id, auth_user_id, dealership_id, email, full_name, role,
--                is_active, phone, image_url, created_at, updated_at

alter table users
  drop column if exists address,
  drop column if exists address2,
  drop column if exists city,
  drop column if exists state,
  drop column if exists zip,
  drop column if exists hire_date,
  drop column if exists commission_rate,
  drop column if exists monthly_goal;
