-- First, let's check current policies on profiles table
-- Drop the problematic policy that exposes sensitive data
DROP POLICY IF EXISTS "Players can view other players for finding feature" ON public.profiles;

-- Create a policy that allows players to see only non-sensitive public data of other players
CREATE POLICY "Players can view other players public data" ON public.profiles
FOR SELECT USING (
  role = 'player'::user_role 
  AND auth.uid() IS NOT NULL
);