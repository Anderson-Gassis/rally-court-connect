-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('player', 'partner', 'admin');

-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT 'player';

-- Update existing profiles to have player role by default
UPDATE public.profiles SET role = 'player' WHERE role IS NULL;

-- Create partner_info table for additional partner data
CREATE TABLE public.partner_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  business_name TEXT,
  cnpj TEXT,
  business_type TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  business_address TEXT,
  website_url TEXT,
  description TEXT,
  verified BOOLEAN DEFAULT false,
  commission_rate NUMERIC DEFAULT 10.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  payment_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on partner_info
ALTER TABLE public.partner_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partner_info
CREATE POLICY "Partners can view their own info" ON public.partner_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners can update their own info" ON public.partner_info
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Partners can insert their own info" ON public.partner_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add trigger for partner_info timestamps
CREATE TRIGGER update_partner_info_updated_at
  BEFORE UPDATE ON public.partner_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE profiles.user_id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update courts table to link to partner profile
ALTER TABLE public.courts ADD COLUMN partner_id UUID REFERENCES public.partner_info(user_id);

-- Update existing courts to use owner_id as partner_id temporarily
UPDATE public.courts SET partner_id = owner_id WHERE owner_id IS NOT NULL;

-- Create partner dashboard view
CREATE OR REPLACE VIEW public.partner_dashboard AS
SELECT 
  p.user_id,
  p.business_name,
  p.verified,
  COUNT(DISTINCT c.id) as total_courts,
  COUNT(DISTINCT CASE WHEN c.available = true THEN c.id END) as active_courts,
  COUNT(DISTINCT b.id) as total_bookings,
  COUNT(DISTINCT CASE WHEN b.status = 'confirmed' THEN b.id END) as confirmed_bookings,
  COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_price END), 0) as total_revenue,
  COALESCE(AVG(c.rating), 0) as average_rating
FROM public.partner_info p
LEFT JOIN public.courts c ON c.partner_id = p.user_id
LEFT JOIN public.bookings b ON b.court_id = c.id
WHERE p.user_id = auth.uid()
GROUP BY p.user_id, p.business_name, p.verified;