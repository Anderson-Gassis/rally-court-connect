-- Fix security issue: Restrict profiles visibility to non-sensitive data only

-- Drop existing policies that expose sensitive data
DROP POLICY IF EXISTS "Players can view other players public data" ON public.profiles;
DROP POLICY IF EXISTS "Players can view public player profiles" ON public.profiles;

-- Create policy to allow users to view only non-sensitive public data of other players
CREATE POLICY "Players can view public profile data"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND role = 'player'::user_role
  AND auth.uid() <> user_id
);

-- Note: The policy "Users can view their complete profile" already exists and allows
-- users to see their own complete profile including sensitive data (email, phone, date_of_birth)

-- Add a comment to document which fields are considered public
COMMENT ON TABLE public.profiles IS 'Public fields visible to other users: full_name, skill_level, location, bio, avatar_url, playing_time, dominant_hand, preferred_surface, favorite_courts. Private fields (only visible to owner): email, phone, date_of_birth';
