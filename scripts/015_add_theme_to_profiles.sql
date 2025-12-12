-- Add theme column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'cyberpunk';
