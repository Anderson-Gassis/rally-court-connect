-- ========================================
-- SISTEMA DE ROLES E ADMIN - CORRIGIDO
-- Data: 2025-10-15
-- ========================================

-- 1. Criar enum para roles (apenas se não existir)
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'partner', 'instructor', 'player');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Criar tabela de roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Funções SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- 4. Policies user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 5. Atribuir roles ao admin
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role FROM profiles WHERE email = 'anders.assis1985@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'partner'::app_role FROM profiles WHERE email = 'anders.assis1985@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'instructor'::app_role FROM profiles WHERE email = 'anders.assis1985@gmail.com'
ON CONFLICT DO NOTHING;

-- 6. Criar perfis se não existirem
INSERT INTO public.partner_info (user_id, business_name, description, location, verified, commission_rate)
SELECT user_id, 'Kourtify Admin', 'Conta administrativa', 'Brasil', true, 10.0
FROM profiles WHERE email = 'anders.assis1985@gmail.com'
AND NOT EXISTS (SELECT 1 FROM partner_info WHERE user_id = profiles.user_id);

INSERT INTO public.instructor_info (user_id, specialization, experience_years, hourly_rate, bio, location, verified)
SELECT user_id, ARRAY['Tennis', 'Beach Tennis']::text[], 10, 100, 'Admin', 'Brasil', true
FROM profiles WHERE email = 'anders.assis1985@gmail.com'
AND NOT EXISTS (SELECT 1 FROM instructor_info WHERE user_id = profiles.user_id);

-- 7. POLICIES ADMIN - Acesso total
DROP POLICY IF EXISTS "Admins can manage all courts" ON public.courts;
CREATE POLICY "Admins can manage all courts" ON public.courts
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all availability" ON public.court_availability;
CREATE POLICY "Admins can manage all availability" ON public.court_availability
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all blocked times" ON public.court_blocked_times;
CREATE POLICY "Admins can manage all blocked times" ON public.court_blocked_times
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings
FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all instructors" ON public.instructor_info;
CREATE POLICY "Admins can manage all instructors" ON public.instructor_info
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all instructor availability" ON public.instructor_availability;
CREATE POLICY "Admins can manage all instructor availability" ON public.instructor_availability
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all instructor blocked times" ON public.instructor_blocked_times;
CREATE POLICY "Admins can manage all instructor blocked times" ON public.instructor_blocked_times
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all class bookings" ON public.class_bookings;
CREATE POLICY "Admins can view all class bookings" ON public.class_bookings
FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all partners" ON public.partner_info;
CREATE POLICY "Admins can manage all partners" ON public.partner_info
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all tournaments" ON public.tournaments;
CREATE POLICY "Admins can manage all tournaments" ON public.tournaments
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all tournament registrations" ON public.tournament_registrations;
CREATE POLICY "Admins can view all tournament registrations" ON public.tournament_registrations
FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all leagues" ON public.leagues;
CREATE POLICY "Admins can manage all leagues" ON public.leagues
FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));