-- VV Hotspots Database Schema
-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hotspots table for locations
CREATE TABLE IF NOT EXISTS public.hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cafe', 'park', 'gaming', 'food', 'hangout', 'other')),
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create check_ins table for user check-ins
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hotspot_id UUID NOT NULL REFERENCES public.hotspots(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create ratings table for hotspot ratings
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hotspot_id UUID NOT NULL REFERENCES public.hotspots(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hotspot_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Hotspots policies (everyone can read, no user modifications)
CREATE POLICY "hotspots_select_all" ON public.hotspots FOR SELECT USING (true);

-- Check-ins policies
CREATE POLICY "check_ins_select_all" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "check_ins_insert_own" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "check_ins_update_own" ON public.check_ins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "check_ins_delete_own" ON public.check_ins FOR DELETE USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "ratings_select_all" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "ratings_insert_own" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update_own" ON public.ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ratings_delete_own" ON public.ratings FOR DELETE USING (auth.uid() = user_id);
