-- Add points column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'points') THEN
        ALTER TABLE public.profiles ADD COLUMN points INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create hotspot_photos table
CREATE TABLE IF NOT EXISTS public.hotspot_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hotspot_id UUID NOT NULL REFERENCES public.hotspots(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.hotspot_photos ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can view photos
CREATE POLICY "hotspot_photos_select_all" ON public.hotspot_photos FOR SELECT USING (true);

-- Users can upload their own photos
CREATE POLICY "hotspot_photos_insert_own" ON public.hotspot_photos FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own photos (optional but good practice)
CREATE POLICY "hotspot_photos_delete_own" ON public.hotspot_photos FOR DELETE USING (auth.uid() = user_id);
