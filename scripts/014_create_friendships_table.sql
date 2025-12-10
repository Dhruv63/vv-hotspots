-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id_1 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id_1, user_id_2)
);

-- RLS for friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read friendships they are involved in"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can delete friendships they are involved in"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Insert logic is likely handled by accepting friend requests,
-- but we might want an insert policy if we want to allow direct insertion.
-- For now, let's allow authenticated users to insert if they are one of the parties.
CREATE POLICY "Users can insert friendships they are involved in"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);
