-- Add pending_deal status for vehicles linked to an active deal jacket.
-- Must be in its own migration: PostgreSQL forbids using a new enum value
-- in the same transaction that adds it (SQLSTATE 55P04).
alter type vehicle_status add value if not exists 'pending_deal';
