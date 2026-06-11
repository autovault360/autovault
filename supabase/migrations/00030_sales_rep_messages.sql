-- Sales Rep 1-to-1 Messages Module
-- Private messaging between sales representatives within the same dealership.

-- ============================================================
-- 1. conversations
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  last_message_text text
);

CREATE INDEX IF NOT EXISTS idx_conversation_last_message
  ON conversations(last_message_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_conversations_dealership
  ON conversations(dealership_id, last_message_at DESC NULLS LAST);

DROP TRIGGER IF EXISTS set_updated_at_conversations ON conversations;
CREATE TRIGGER set_updated_at_conversations
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. conversation_participants
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_user
  ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_participants_conversation
  ON conversation_participants(conversation_id);

-- ============================================================
-- 3. messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  message_text text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender
  ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_unread
  ON messages(conversation_id, is_read)
  WHERE is_read = false;

-- ============================================================
-- 4. Trigger: update conversation on new message
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_at = NEW.created_at,
    last_message_text = NEW.message_text,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_conversation_on_message ON messages;
CREATE TRIGGER trg_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- ============================================================
-- 5. Helper: user is conversation participant
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    JOIN public.conversations c ON c.id = cp.conversation_id
    WHERE cp.conversation_id = p_conversation_id
      AND cp.user_id = public.auth_user_id()
      AND c.dealership_id = public.auth_user_dealership_id()
  );
$$;

-- ============================================================
-- 6. Row Level Security
-- ============================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- conversations
DROP POLICY IF EXISTS "conversations_select_participant" ON conversations;
CREATE POLICY "conversations_select_participant"
  ON conversations FOR SELECT
  USING (
    public.auth_user_role() = 'sales_rep'
    AND dealership_id = public.auth_user_dealership_id()
    AND public.is_conversation_participant(id)
  );

DROP POLICY IF EXISTS "conversations_insert_sales_rep" ON conversations;
CREATE POLICY "conversations_insert_sales_rep"
  ON conversations FOR INSERT
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND dealership_id = public.auth_user_dealership_id()
  );

DROP POLICY IF EXISTS "conversations_update_participant" ON conversations;
CREATE POLICY "conversations_update_participant"
  ON conversations FOR UPDATE
  USING (
    public.auth_user_role() = 'sales_rep'
    AND dealership_id = public.auth_user_dealership_id()
    AND public.is_conversation_participant(id)
  );

-- conversation_participants
DROP POLICY IF EXISTS "participants_select_own" ON conversation_participants;
CREATE POLICY "participants_select_own"
  ON conversation_participants FOR SELECT
  USING (
    public.auth_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_participants.conversation_id
        AND c.dealership_id = public.auth_user_dealership_id()
        AND public.is_conversation_participant(c.id)
    )
  );

DROP POLICY IF EXISTS "participants_insert_sales_rep" ON conversation_participants;
CREATE POLICY "participants_insert_sales_rep"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_participants.conversation_id
        AND c.dealership_id = public.auth_user_dealership_id()
    )
    AND (
      user_id = public.auth_user_id()
      OR EXISTS (
        SELECT 1 FROM public.conversation_participants cp
        WHERE cp.conversation_id = conversation_participants.conversation_id
          AND cp.user_id = public.auth_user_id()
      )
    )
  );

-- messages
DROP POLICY IF EXISTS "messages_select_participant" ON messages;
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  USING (
    public.auth_user_role() = 'sales_rep'
    AND public.is_conversation_participant(conversation_id)
  );

DROP POLICY IF EXISTS "messages_insert_participant" ON messages;
CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND sender_id = public.auth_user_id()
    AND public.is_conversation_participant(conversation_id)
  );

DROP POLICY IF EXISTS "messages_update_read" ON messages;
CREATE POLICY "messages_update_read"
  ON messages FOR UPDATE
  USING (
    public.auth_user_role() = 'sales_rep'
    AND sender_id <> public.auth_user_id()
    AND public.is_conversation_participant(conversation_id)
  )
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND sender_id <> public.auth_user_id()
    AND public.is_conversation_participant(conversation_id)
  );

-- ============================================================
-- 7. Realtime publication
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
