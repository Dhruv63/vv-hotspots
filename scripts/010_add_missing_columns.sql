-- Add profile columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text DEFAULT 'Vasai-Virar';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_username text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_username text;

-- Add check constraint for bio length
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS bio_length;
ALTER TABLE profiles ADD CONSTRAINT bio_length CHECK (char_length(bio) <= 150);

-- Add check-ins columns
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Add check constraint for note length
ALTER TABLE check_ins DROP CONSTRAINT IF EXISTS note_length;
ALTER TABLE check_ins ADD CONSTRAINT note_length CHECK (char_length(note) <= 150);
