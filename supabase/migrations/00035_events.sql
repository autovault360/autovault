-- Dashboard calendar user events (simple date-based notes/events)

CREATE TABLE IF NOT EXISTS events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id   uuid NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  created_by      uuid NOT NULL REFERENCES users(id),
  event_date      date NOT NULL,
  title           text NOT NULL,
  description     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_dealership_date
  ON events(dealership_id, event_date);

CREATE INDEX IF NOT EXISTS idx_events_created_by
  ON events(created_by);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select_dealership" ON events;
CREATE POLICY "events_select_dealership"
  ON events FOR SELECT
  USING (dealership_id = auth_user_dealership_id());

DROP POLICY IF EXISTS "events_insert_dealership" ON events;
CREATE POLICY "events_insert_dealership"
  ON events FOR INSERT
  WITH CHECK (
    dealership_id = auth_user_dealership_id()
    AND created_by = public.auth_user_id()
  );

DROP POLICY IF EXISTS "events_update_dealership" ON events;
CREATE POLICY "events_update_dealership"
  ON events FOR UPDATE
  USING (dealership_id = auth_user_dealership_id())
  WITH CHECK (dealership_id = auth_user_dealership_id());

DROP POLICY IF EXISTS "events_delete_dealership" ON events;
CREATE POLICY "events_delete_dealership"
  ON events FOR DELETE
  USING (dealership_id = auth_user_dealership_id());

DROP POLICY IF EXISTS "events_service_role" ON events;
CREATE POLICY "events_service_role"
  ON events FOR ALL
  USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();
