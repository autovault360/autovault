-- Document Center: send audit trail + message attachments

-- ============================================================
-- 1. message_attachments
-- ============================================================
CREATE TABLE IF NOT EXISTS message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message
  ON message_attachments(message_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_file
  ON message_attachments(file_id);

-- ============================================================
-- 2. document_sends
-- ============================================================
CREATE TABLE IF NOT EXISTS document_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  recipient_type text NOT NULL CHECK (recipient_type IN ('email', 'sales_rep')),
  recipient_email text,
  recipient_user_id uuid REFERENCES users(id),
  message_text text NOT NULL DEFAULT '',
  sent_at timestamptz NOT NULL DEFAULT now(),
  delivery_method text NOT NULL CHECK (delivery_method IN ('email', 'internal_message')),
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  email_message_id text,
  read_at timestamptz,
  downloaded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_sends_dealership
  ON document_sends(dealership_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_sends_sender
  ON document_sends(sender_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_sends_recipient_user
  ON document_sends(recipient_user_id, sent_at DESC);

-- ============================================================
-- 3. document_send_files
-- ============================================================
CREATE TABLE IF NOT EXISTS document_send_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id uuid NOT NULL REFERENCES document_sends(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  viewed_at timestamptz,
  downloaded_at timestamptz,
  UNIQUE(send_id, file_id)
);

CREATE INDEX IF NOT EXISTS idx_document_send_files_send
  ON document_send_files(send_id);

-- ============================================================
-- 4. Row Level Security
-- ============================================================
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_send_files ENABLE ROW LEVEL SECURITY;

-- message_attachments: visible to conversation participants
DROP POLICY IF EXISTS "message_attachments_select_participant" ON message_attachments;
CREATE POLICY "message_attachments_select_participant"
  ON message_attachments FOR SELECT
  USING (
    public.auth_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_attachments.message_id
        AND public.is_conversation_participant(m.conversation_id)
    )
  );

DROP POLICY IF EXISTS "message_attachments_insert_participant" ON message_attachments;
CREATE POLICY "message_attachments_insert_participant"
  ON message_attachments FOR INSERT
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = message_attachments.message_id
        AND m.sender_id = public.auth_user_id()
        AND public.is_conversation_participant(m.conversation_id)
    )
  );

-- document_sends
DROP POLICY IF EXISTS "document_sends_select_dealership" ON document_sends;
CREATE POLICY "document_sends_select_dealership"
  ON document_sends FOR SELECT
  USING (
    public.auth_user_role() = 'sales_rep'
    AND dealership_id = public.auth_user_dealership_id()
  );

DROP POLICY IF EXISTS "document_sends_insert_dealership" ON document_sends;
CREATE POLICY "document_sends_insert_dealership"
  ON document_sends FOR INSERT
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND dealership_id = public.auth_user_dealership_id()
    AND sender_id = public.auth_user_id()
  );

DROP POLICY IF EXISTS "document_sends_update_dealership" ON document_sends;
CREATE POLICY "document_sends_update_dealership"
  ON document_sends FOR UPDATE
  USING (
    public.auth_user_role() = 'sales_rep'
    AND dealership_id = public.auth_user_dealership_id()
  );

-- document_send_files
DROP POLICY IF EXISTS "document_send_files_select_dealership" ON document_send_files;
CREATE POLICY "document_send_files_select_dealership"
  ON document_send_files FOR SELECT
  USING (
    public.auth_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM public.document_sends ds
      WHERE ds.id = document_send_files.send_id
        AND ds.dealership_id = public.auth_user_dealership_id()
    )
  );

DROP POLICY IF EXISTS "document_send_files_insert_dealership" ON document_send_files;
CREATE POLICY "document_send_files_insert_dealership"
  ON document_send_files FOR INSERT
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM public.document_sends ds
      WHERE ds.id = document_send_files.send_id
        AND ds.dealership_id = public.auth_user_dealership_id()
        AND ds.sender_id = public.auth_user_id()
    )
  );

DROP POLICY IF EXISTS "document_send_files_update_dealership" ON document_send_files;
CREATE POLICY "document_send_files_update_dealership"
  ON document_send_files FOR UPDATE
  USING (
    public.auth_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM public.document_sends ds
      WHERE ds.id = document_send_files.send_id
        AND ds.dealership_id = public.auth_user_dealership_id()
    )
  );
