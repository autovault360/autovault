-- Migration: Deal Jacket Workflow Status and Activity Tracking
-- Adds workflow_status, review columns to deal_jackets
-- Creates deal_jacket_activity table for immutable audit trail

-- ============================================================
-- 1. Add workflow columns to deal_jackets
-- ============================================================
ALTER TABLE deal_jackets
  ADD COLUMN workflow_status text NOT NULL DEFAULT 'pending_review'
    CHECK (workflow_status IN ('pending_review','changes_requested','resubmitted','approved','rejected')),
  ADD COLUMN review_notes text,
  ADD COLUMN reviewed_by uuid REFERENCES users(id),
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN change_categories text[],
  ADD COLUMN rejection_reason text;

-- ============================================================
-- 2. Unique active deal jacket per vehicle
--    Only one deal jacket can be active (non-approved, non-rejected) per vehicle
-- ============================================================
DROP INDEX IF EXISTS idx_active_deal_jacket_vehicle;
CREATE UNIQUE INDEX idx_active_deal_jacket_vehicle
  ON deal_jackets(vehicle_id)
  WHERE workflow_status NOT IN ('approved','rejected') AND deleted_at IS NULL;

-- ============================================================
-- 3. Deal Jacket Activity Table (immutable audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS deal_jacket_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_jacket_id uuid NOT NULL REFERENCES deal_jackets(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN (
    'created','submitted','changes_requested','resubmitted',
    'approved','rejected','note_added','document_uploaded'
  )),
  actor_id uuid NOT NULL REFERENCES users(id),
  actor_name text NOT NULL,
  old_status text,
  new_status text,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dj_activity_jacket ON deal_jacket_activity(deal_jacket_id, created_at DESC);
CREATE INDEX idx_dj_activity_actor ON deal_jacket_activity(actor_id);

-- ============================================================
-- 4. RLS Policies for deal_jacket_activity
-- ============================================================
ALTER TABLE deal_jacket_activity ENABLE ROW LEVEL SECURITY;

-- Users can view activities for deal jackets in their dealership
CREATE POLICY "dealership_select_deal_jacket_activity"
  ON deal_jacket_activity
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM deal_jackets dj
      WHERE dj.id = deal_jacket_activity.deal_jacket_id
        AND dj.dealership_id = public.auth_user_dealership_id()
    )
  );

-- Service role insert (server actions insert programmatically)
CREATE POLICY "server_insert_deal_jacket_activity"
  ON deal_jacket_activity
  FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- 5. Update existing deal_jackets RLS to allow workflow updates
-- ============================================================
-- Drop existing update policy if it exists and recreate
DROP POLICY IF EXISTS "dealership_update_deal_jackets" ON deal_jackets;

CREATE POLICY "dealership_update_deal_jackets"
  ON deal_jackets
  FOR UPDATE
  USING (
    dealership_id = public.auth_user_dealership_id()
  )
  WITH CHECK (
    dealership_id = public.auth_user_dealership_id()
  );
