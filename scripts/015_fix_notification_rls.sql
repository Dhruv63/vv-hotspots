-- Fix RLS policy for notifications update to ensure mark-read works
-- This explicitly grants UPDATE permission with proper checks

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
