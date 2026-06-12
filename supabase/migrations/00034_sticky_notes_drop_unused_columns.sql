-- Sticky notes: hard delete is used; title and soft-delete columns are unused.

DELETE FROM sticky_notes WHERE deleted_at IS NOT NULL;

ALTER TABLE sticky_notes
  DROP COLUMN IF EXISTS deleted_at,
  DROP COLUMN IF EXISTS title;

ALTER TABLE sticky_notes
  ALTER COLUMN color SET DEFAULT '#FFD966';
