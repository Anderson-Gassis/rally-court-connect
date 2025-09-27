-- Fix RLS policies for courts table
DROP POLICY IF EXISTS "Authenticated users can create courts" ON public.courts;

CREATE POLICY "Users can create courts with themselves as owner" 
ON public.courts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Also ensure partner_id can be null or match the user (for when partner creates court)
CREATE POLICY "Partners can create courts" 
ON public.courts 
FOR INSERT 
TO authenticated  
WITH CHECK (
  auth.uid() = owner_id OR 
  (partner_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.partner_info pi 
    WHERE pi.user_id = auth.uid() AND pi.id = partner_id
  ))
);

-- Drop the old policy to avoid conflicts
DROP POLICY IF EXISTS "Users can create courts with themselves as owner" ON public.courts;

-- Create comprehensive court creation policy
CREATE POLICY "Authenticated users can create their own courts" 
ON public.courts 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = owner_id AND 
  (partner_id IS NULL OR EXISTS (
    SELECT 1 FROM public.partner_info pi 
    WHERE pi.user_id = auth.uid()
  ))
);