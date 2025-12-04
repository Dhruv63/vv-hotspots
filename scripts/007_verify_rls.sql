-- Verify and strengthen Row Level Security policies
-- Run this to ensure all tables have RLS enabled

-- Check RLS is enabled on all tables
DO $$
BEGIN
  -- Profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Hotspots
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'hotspots' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Check-ins
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'check_ins' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Ratings
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'ratings' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Force RLS for table owners (extra security)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.hotspots FORCE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ratings FORCE ROW LEVEL SECURITY;

-- Add additional security: prevent users from updating other users' data
-- Drop and recreate policies with stricter checks

-- Ensure check-ins can only be created with matching user_id
DROP POLICY IF EXISTS "check_ins_insert_strict" ON public.check_ins;
CREATE POLICY "check_ins_insert_strict" ON public.check_ins 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND auth.uid() IS NOT NULL
  );

-- Ensure ratings can only be created with matching user_id
DROP POLICY IF EXISTS "ratings_insert_strict" ON public.ratings;
CREATE POLICY "ratings_insert_strict" ON public.ratings 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND auth.uid() IS NOT NULL
    AND rating >= 1 
    AND rating <= 5
  );

-- Add check constraint for rating values if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'ratings_rating_check'
  ) THEN
    ALTER TABLE public.ratings 
    ADD CONSTRAINT ratings_rating_check 
    CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

-- Limit review length at database level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'ratings_review_length_check'
  ) THEN
    ALTER TABLE public.ratings 
    ADD CONSTRAINT ratings_review_length_check 
    CHECK (review IS NULL OR length(review) <= 1000);
  END IF;
END $$;

-- Limit username length at database level
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'profiles_username_length_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_username_length_check 
    CHECK (username IS NULL OR length(username) <= 30);
  END IF;
END $$;
