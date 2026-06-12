-- Sticky Notes: shared cross-dashboard sticky notes
-- Every note is tied to a dealership, a user, and a dashboard path
-- for routing notes back to where they were created.

-- ============================================================
-- 1. sticky_notes table
-- ============================================================
CREATE TABLE IF NOT EXISTS sticky_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id   uuid NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES users(id),
  color           text NOT NULL DEFAULT '#fef08a',
  title           text,
  text            text NOT NULL,
  is_pinned       boolean NOT NULL DEFAULT false,
  dashboard_path  text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

-- ============================================================
-- 2. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sticky_notes_dealership
  ON sticky_notes(dealership_id);

CREATE INDEX IF NOT EXISTS idx_sticky_notes_user
  ON sticky_notes(user_id);

CREATE INDEX IF NOT EXISTS idx_sticky_notes_dashboard
  ON sticky_notes(dealership_id, dashboard_path);

CREATE INDEX IF NOT EXISTS idx_sticky_notes_pinned
  ON sticky_notes(dealership_id, is_pinned, created_at DESC);

-- ============================================================
-- 3. Row Level Security
-- ============================================================
ALTER TABLE sticky_notes ENABLE ROW LEVEL SECURITY;

-- All dealership users can read notes for their dealership
DROP POLICY IF EXISTS "sticky_notes_select_dealership" ON sticky_notes;
CREATE POLICY "sticky_notes_select_dealership"
  ON sticky_notes FOR SELECT
  USING (dealership_id = auth_user_dealership_id());

-- Users can insert notes for their dealership as themselves
DROP POLICY IF EXISTS "sticky_notes_insert_dealership" ON sticky_notes;
CREATE POLICY "sticky_notes_insert_dealership"
  ON sticky_notes FOR INSERT
  WITH CHECK (
    dealership_id = auth_user_dealership_id()
    AND user_id = public.auth_user_id()
  );

-- Users can update notes within their dealership
DROP POLICY IF EXISTS "sticky_notes_update_dealership" ON sticky_notes;
CREATE POLICY "sticky_notes_update_dealership"
  ON sticky_notes FOR UPDATE
  USING (dealership_id = auth_user_dealership_id())
  WITH CHECK (dealership_id = auth_user_dealership_id());

-- Users can delete notes within their dealership
DROP POLICY IF EXISTS "sticky_notes_delete_dealership" ON sticky_notes;
CREATE POLICY "sticky_notes_delete_dealership"
  ON sticky_notes FOR DELETE
  USING (dealership_id = auth_user_dealership_id());

-- Service role bypass
DROP POLICY IF EXISTS "sticky_notes_service_role" ON sticky_notes;
CREATE POLICY "sticky_notes_service_role"
  ON sticky_notes FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 4. Trigger: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_sticky_notes_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sticky_notes_updated_at ON sticky_notes;
CREATE TRIGGER trg_sticky_notes_updated_at
  BEFORE UPDATE ON sticky_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_sticky_notes_updated_at();
