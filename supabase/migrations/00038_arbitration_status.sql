-- Add arbitration status for wholesale vehicles in dispute.
-- Must be in its own migration: PostgreSQL forbids using a new enum value
-- in the same transaction that adds it (SQLSTATE 55P04).
alter type vehicle_status add value if not exists 'arbitration';
