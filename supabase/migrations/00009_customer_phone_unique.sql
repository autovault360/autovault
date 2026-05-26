-- Enforce unique phone per dealership for active customers.
-- Before applying in production, deduplicate existing rows:
--   SELECT dealership_id, phone, count(*) FROM customers
--   WHERE deleted_at IS NULL AND phone IS NOT NULL
--   GROUP BY dealership_id, phone HAVING count(*) > 1;

create unique index if not exists idx_customers_phone_unique
  on customers (dealership_id, phone)
  where deleted_at is null and phone is not null;
