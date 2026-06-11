-- Link deal_jackets to sales_rep_commissions for 1:1 commission lookup.
-- sales_rep_commissions.deal_jacket_id already references deal_jackets(id);
-- this reverse FK enables direct embedding from deal_jackets in PostgREST.

ALTER TABLE deal_jackets
  ADD COLUMN IF NOT EXISTS sales_rep_commission_id uuid
  REFERENCES sales_rep_commissions(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_deal_jackets_sales_rep_commission_id
  ON deal_jackets(sales_rep_commission_id)
  WHERE sales_rep_commission_id IS NOT NULL;

-- Backfill existing links
UPDATE deal_jackets dj
SET sales_rep_commission_id = src.id
FROM sales_rep_commissions src
WHERE src.deal_jacket_id = dj.id
  AND src.deleted_at IS NULL
  AND dj.sales_rep_commission_id IS NULL;
