-- Add review column to ratings table for user comments
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS review TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN ratings.review IS 'User written review/comment for this rating';
