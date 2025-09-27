-- Fix critical security vulnerability: Remove public access to personal data
-- This fixes the "Customer Personal Data Could Be Stolen by Anyone" error

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);