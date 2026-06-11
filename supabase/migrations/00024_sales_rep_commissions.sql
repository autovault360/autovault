-- Migration: Sales Rep Commissions Table
-- Tracks commission records linked to deal jackets for sales rep payroll/earnings.
-- One commission record per deal jacket (1:1 relationship).
-- Status mirrors deal_jacket workflow_status plus 'paid' for payout tracking.

-- ============================================================
-- 1. Helper: auth_user_id() for RLS (must exist before policies)
-- ============================================================
CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT id FROM public.users WHERE auth_user_id = auth.uid() LIMIT 1),
    auth.uid()
  );
$$;

-- ============================================================
-- 2. Create sales_rep_commissions table
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_rep_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  sales_rep_id uuid NOT NULL REFERENCES users(id),
  deal_jacket_id uuid NOT NULL UNIQUE REFERENCES deal_jackets(id) ON DELETE CASCADE,

  -- Financial snapshot (denormalized for historical accuracy)
  commission_amount numeric(12,2) NOT NULL,
  commission_rate numeric(5,4) NOT NULL,
  gross_profit numeric(12,2) NOT NULL,
  sold_price numeric(12,2) NOT NULL,

  -- Status lifecycle: pending_review -> changes_requested -> resubmitted -> approved -> paid
  --                                                       -> rejected (no payout)
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN (
      'pending_review','changes_requested','resubmitted',
      'approved','rejected','paid'
    )),

  -- Payment tracking
  paid_at timestamptz,
  paid_by uuid REFERENCES users(id),

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- ============================================================
-- 2. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sr_commissions_dealership
  ON sales_rep_commissions(dealership_id);

CREATE INDEX IF NOT EXISTS idx_sr_commissions_sales_rep
  ON sales_rep_commissions(dealership_id, sales_rep_id);

CREATE INDEX IF NOT EXISTS idx_sr_commissions_status
  ON sales_rep_commissions(dealership_id, sales_rep_id, status);

CREATE INDEX IF NOT EXISTS idx_sr_commissions_deal_jacket
  ON sales_rep_commissions(deal_jacket_id);

-- ============================================================
-- 3. Enable RLS
-- ============================================================
ALTER TABLE sales_rep_commissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. RLS Policies
-- ============================================================

-- Sales reps can read their own commissions
CREATE POLICY "sr_commissions_self_select"
  ON sales_rep_commissions
  FOR SELECT
  USING (
    dealership_id = public.auth_user_dealership_id()
    AND (
      sales_rep_id = public.auth_user_id()
      OR public.is_super_admin()
      OR public.auth_user_role() IN ('owner','manager')
    )
  );

-- Super admin / owner / manager can insert
CREATE POLICY "sr_commissions_admin_insert"
  ON sales_rep_commissions
  FOR INSERT
  WITH CHECK (
    dealership_id = public.auth_user_dealership_id()
    AND public.auth_user_role() IN ('super_admin','owner','manager')
  );

-- Super admin / owner / manager can update
CREATE POLICY "sr_commissions_admin_update"
  ON sales_rep_commissions
  FOR UPDATE
  USING (
    dealership_id = public.auth_user_dealership_id()
    AND public.auth_user_role() IN ('super_admin','owner','manager')
  )
  WITH CHECK (
    dealership_id = public.auth_user_dealership_id()
    AND public.auth_user_role() IN ('super_admin','owner','manager')
  );

-- Soft-delete by admins
CREATE POLICY "sr_commissions_admin_delete"
  ON sales_rep_commissions
  FOR DELETE
  USING (
    dealership_id = public.auth_user_dealership_id()
    AND public.auth_user_role() IN ('super_admin','owner','manager')
  );

-- ============================================================
-- 5. Updated-at trigger
-- ============================================================
CREATE TRIGGER trigger_sales_rep_commissions_updated_at
  BEFORE UPDATE ON sales_rep_commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


