-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'friend_request', 'friend_accept'
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read requests they are involved in"
  ON friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Anyone can read accepted requests"
  ON friend_requests FOR SELECT
  USING (status = 'accepted');

CREATE POLICY "Users can insert requests as sender"
  ON friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update requests they are involved in"
  ON friend_requests FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can delete requests they are involved in"
  ON friend_requests FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Ideally restricted, but for now allow inserts so our server actions/triggers work if they run as user.
  -- Actually, if running as user A sending to B, user A needs to insert notification for B.
  -- So "Users can insert notifications" is needed.
  -- We might want to restrict to "user_id != auth.uid()" or something, but usually "Authenticated users can insert" is fine for this app.

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
BEFORE UPDATE ON friend_requests
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function for mutual friends
CREATE OR REPLACE FUNCTION get_mutual_friends(user_id_1 UUID, user_id_2 UUID)
RETURNS TABLE (
  friend_id UUID,
  username TEXT,
  avatar_url TEXT
) AS $$
  SELECT p.id, p.username, p.avatar_url
  FROM profiles p
  JOIN (
    SELECT CASE WHEN sender_id = user_id_1 THEN receiver_id ELSE sender_id END as f_id
    FROM friend_requests
    WHERE status = 'accepted' AND (sender_id = user_id_1 OR receiver_id = user_id_1)
  ) f1 ON p.id = f1.f_id
  JOIN (
    SELECT CASE WHEN sender_id = user_id_2 THEN receiver_id ELSE sender_id END as f_id
    FROM friend_requests
    WHERE status = 'accepted' AND (sender_id = user_id_2 OR receiver_id = user_id_2)
  ) f2 ON f1.f_id = f2.f_id;
$$ LANGUAGE sql SECURITY DEFINER;
