-- Enable RLS on hotspot_photos table if not already enabled
-- This script assumes the hotspot_photos table exists (run 008_create_hotspot_photos.sql first)

ALTER TABLE IF EXISTS public.hotspot_photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure idempotency and clean state
DROP POLICY IF EXISTS "hotspot_photos_select_all" ON public.hotspot_photos;
DROP POLICY IF EXISTS "hotspot_photos_insert_own" ON public.hotspot_photos;
DROP POLICY IF EXISTS "hotspot_photos_delete_own" ON public.hotspot_photos;

-- 1. Policy to allow anyone to SELECT/view all photos
CREATE POLICY "hotspot_photos_select_all"
ON public.hotspot_photos
FOR SELECT
USING (true);

-- 2. Policy to allow authenticated users to INSERT their own photos
-- user_id must match auth.uid()
CREATE POLICY "hotspot_photos_insert_own"
ON public.hotspot_photos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Policy to allow users to DELETE only their own photos
-- user_id must match auth.uid()
CREATE POLICY "hotspot_photos_delete_own"
ON public.hotspot_photos
FOR DELETE
USING (auth.uid() = user_id);
