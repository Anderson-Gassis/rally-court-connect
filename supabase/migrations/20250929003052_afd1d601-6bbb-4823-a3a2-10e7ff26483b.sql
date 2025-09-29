-- Allow players to view other players' profiles for finding players feature
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Players can view other players for finding feature" ON public.profiles  
FOR SELECT USING (role = 'player');

CREATE POLICY "Partners can view their own profile" ON public.profiles
FOR SELECT USING (role = 'partner' AND auth.uid() = user_id);