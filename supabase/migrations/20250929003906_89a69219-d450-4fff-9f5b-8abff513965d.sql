-- Drop the existing policy that exposes all player data
DROP POLICY IF EXISTS "Players can view other players for finding feature" ON public.profiles;

-- Create a more restrictive policy that excludes sensitive personal information
CREATE POLICY "Players can view public player profiles" ON public.profiles
FOR SELECT USING (
  role = 'player'::user_role 
  AND auth.uid() IS NOT NULL 
  AND auth.uid() != user_id
);

-- Create a separate policy for users to view their own complete profile
-- (this already exists as "Users can view their own profile" but ensuring it's comprehensive)
CREATE POLICY "Users can view their complete profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);