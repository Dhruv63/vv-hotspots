-- Create check_in_likes table
CREATE TABLE IF NOT EXISTS check_in_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  check_in_id uuid REFERENCES check_ins(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, check_in_id)
);

-- Create saved_hotspots table
CREATE TABLE IF NOT EXISTS saved_hotspots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hotspot_id uuid REFERENCES hotspots(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, hotspot_id)
);

-- Enable RLS
ALTER TABLE check_in_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_hotspots ENABLE ROW LEVEL SECURITY;

-- Policies for check_in_likes
CREATE POLICY "Anyone can read check_in_likes"
  ON check_in_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like check_ins"
  ON check_in_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike check_ins"
  ON check_in_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for saved_hotspots
CREATE POLICY "Users can read own saved hotspots"
  ON saved_hotspots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can save hotspots"
  ON saved_hotspots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved hotspots"
  ON saved_hotspots FOR DELETE
  USING (auth.uid() = user_id);
