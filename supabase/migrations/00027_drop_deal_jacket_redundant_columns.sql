-- Remove legacy columns superseded by workflow_status and sales_rep_commissions.

DROP INDEX IF EXISTS idx_deal_jackets_status;

ALTER TABLE deal_jackets
  DROP COLUMN IF EXISTS commission_status,
  DROP COLUMN IF EXISTS status;
