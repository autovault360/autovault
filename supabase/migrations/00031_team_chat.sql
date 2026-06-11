-- Sales Rep Team Chat: one group per dealership, all sales reps are members.

CREATE TABLE IF NOT EXISTS team_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id uuid NOT NULL UNIQUE REFERENCES dealerships(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Team Chat',
  description text NOT NULL DEFAULT 'Group messaging with your entire team.',
  created_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  last_message_text text
);

CREATE INDEX IF NOT EXISTS idx_team_chats_dealership ON team_chats(dealership_id);
CREATE INDEX IF NOT EXISTS idx_team_chats_last_message ON team_chats(last_message_at DESC NULLS LAST);

DROP TRIGGER IF EXISTS set_updated_at_team_chats ON team_chats;
CREATE TRIGGER set_updated_at_team_chats
  BEFORE UPDATE ON team_chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS team_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_chat_id uuid NOT NULL REFERENCES team_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  message_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_team_chat_messages_chat
  ON team_chat_messages(team_chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_team_chat_messages_sender
  ON team_chat_messages(sender_id);

CREATE TABLE IF NOT EXISTS team_chat_member_reads (
  team_chat_id uuid NOT NULL REFERENCES team_chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (team_chat_id, user_id)
);

CREATE OR REPLACE FUNCTION public.update_team_chat_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.team_chats
  SET
    last_message_at = NEW.created_at,
    last_message_text = NEW.message_text,
    updated_at = now()
  WHERE id = NEW.team_chat_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_team_chat_on_message ON team_chat_messages;
CREATE TRIGGER trg_update_team_chat_on_message
  AFTER INSERT ON team_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_team_chat_on_message();

CREATE OR REPLACE FUNCTION public.is_team_chat_member(p_team_chat_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_chats tc
    JOIN public.users u ON u.dealership_id = tc.dealership_id
    WHERE tc.id = p_team_chat_id
      AND u.id = public.auth_user_id()
      AND u.role = 'sales_rep'
      AND u.is_active = true
      AND tc.dealership_id = public.auth_user_dealership_id()
  );
$$;

ALTER TABLE team_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_chat_member_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "team_chats_select_member" ON team_chats;
CREATE POLICY "team_chats_select_member"
  ON team_chats FOR SELECT
  USING (
    public.auth_user_role() = 'sales_rep'
    AND dealership_id = public.auth_user_dealership_id()
  );

DROP POLICY IF EXISTS "team_chats_insert_sales_rep" ON team_chats;
CREATE POLICY "team_chats_insert_sales_rep"
  ON team_chats FOR INSERT
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND dealership_id = public.auth_user_dealership_id()
  );

DROP POLICY IF EXISTS "team_chats_update_member" ON team_chats;
CREATE POLICY "team_chats_update_member"
  ON team_chats FOR UPDATE
  USING (
    public.auth_user_role() = 'sales_rep'
    AND dealership_id = public.auth_user_dealership_id()
  );

DROP POLICY IF EXISTS "team_chat_messages_select_member" ON team_chat_messages;
CREATE POLICY "team_chat_messages_select_member"
  ON team_chat_messages FOR SELECT
  USING (
    public.auth_user_role() = 'sales_rep'
    AND public.is_team_chat_member(team_chat_id)
  );

DROP POLICY IF EXISTS "team_chat_messages_insert_member" ON team_chat_messages;
CREATE POLICY "team_chat_messages_insert_member"
  ON team_chat_messages FOR INSERT
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND sender_id = public.auth_user_id()
    AND public.is_team_chat_member(team_chat_id)
  );

DROP POLICY IF EXISTS "team_chat_reads_select_member" ON team_chat_member_reads;
CREATE POLICY "team_chat_reads_select_member"
  ON team_chat_member_reads FOR SELECT
  USING (
    public.auth_user_role() = 'sales_rep'
    AND public.is_team_chat_member(team_chat_id)
  );

DROP POLICY IF EXISTS "team_chat_reads_upsert_self" ON team_chat_member_reads;
CREATE POLICY "team_chat_reads_upsert_self"
  ON team_chat_member_reads FOR INSERT
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND user_id = public.auth_user_id()
    AND public.is_team_chat_member(team_chat_id)
  );

DROP POLICY IF EXISTS "team_chat_reads_update_self" ON team_chat_member_reads;
CREATE POLICY "team_chat_reads_update_self"
  ON team_chat_member_reads FOR UPDATE
  USING (
    public.auth_user_role() = 'sales_rep'
    AND user_id = public.auth_user_id()
    AND public.is_team_chat_member(team_chat_id)
  )
  WITH CHECK (
    public.auth_user_role() = 'sales_rep'
    AND user_id = public.auth_user_id()
    AND public.is_team_chat_member(team_chat_id)
  );

ALTER PUBLICATION supabase_realtime ADD TABLE team_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE team_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE team_chat_member_reads;
