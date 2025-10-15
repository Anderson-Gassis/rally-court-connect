-- ========================================
-- CORREÇÃO DE SEGURANÇA CRÍTICA - FINAL
-- Data: 2025-10-15
-- ========================================

-- 1. PROFILES - Respeitar privacidade
DROP POLICY IF EXISTS "Players can view public profile data" ON public.profiles;

CREATE POLICY "Users can view public profiles respecting privacy" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id OR profile_visibility = 'public');

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id, full_name, avatar_url, location, role, skill_level,
  CASE WHEN show_email = true THEN email ELSE NULL END as email,
  CASE WHEN show_phone = true THEN phone ELSE NULL END as phone,
  bio, playing_time, dominant_hand, preferred_surface, ranking_points, ranking_position
FROM public.profiles
WHERE profile_visibility = 'public';

-- 2. PARTNER_INFO - Proteger dados financeiros
DROP POLICY IF EXISTS "Partners can view their own info" ON public.partner_info;
DROP POLICY IF EXISTS "Partner info is viewable by everyone" ON public.partner_info;

CREATE POLICY "Partners view own info only" ON public.partner_info 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners update own info only" ON public.partner_info 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create partner profile" ON public.partner_info 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE VIEW public.public_partner_info AS
SELECT 
  id, user_id, business_name, description, location, specialization,
  website_url, verified, business_type, business_address,
  contact_email, contact_phone, created_at, updated_at
FROM public.partner_info WHERE verified = true;

-- 3. TOURNAMENT_REGISTRATIONS - Proteger pagamentos
DROP POLICY IF EXISTS "Anyone can view registrations for public tournaments" ON public.tournament_registrations;

CREATE POLICY "Users view own tournament registrations" 
ON public.tournament_registrations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Organizers view their tournament registrations" 
ON public.tournament_registrations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM tournaments 
  WHERE tournaments.id = tournament_registrations.tournament_id 
  AND tournaments.organizer_id = auth.uid()
));

CREATE OR REPLACE VIEW public.public_tournament_registrations AS
SELECT 
  id, tournament_id, user_id, registration_date, payment_status
FROM public.tournament_registrations
WHERE payment_status = 'paid';

-- 4. CLASS_BOOKINGS - Proteger receitas
DROP POLICY IF EXISTS "Alunos podem ver suas próprias reservas" ON public.class_bookings;
DROP POLICY IF EXISTS "Instrutores podem ver reservas de suas aulas" ON public.class_bookings;

CREATE POLICY "Students view own bookings limited" 
ON public.class_bookings FOR SELECT 
USING (auth.uid() = student_id);

CREATE POLICY "Instructors view their bookings limited" 
ON public.class_bookings FOR SELECT 
USING (instructor_id IN (SELECT id FROM instructor_info WHERE user_id = auth.uid()));

CREATE OR REPLACE VIEW public.student_class_bookings AS
SELECT 
  id, class_id, student_id, instructor_id, booking_date,
  start_time, end_time, status, payment_status, total_price,
  is_trial, notes, created_at, updated_at
FROM public.class_bookings;

CREATE OR REPLACE VIEW public.instructor_class_bookings AS
SELECT 
  id, class_id, student_id, instructor_id, booking_date,
  start_time, end_time, status, payment_status, instructor_amount,
  is_trial, notes, created_at, updated_at
FROM public.class_bookings;

-- 5. BOOKINGS - Proteger comissões
CREATE OR REPLACE VIEW public.user_bookings AS
SELECT 
  id, court_id, user_id, booking_date, start_time, end_time,
  total_price, booking_quantity, payment_status, status,
  created_at, updated_at
FROM public.bookings;

CREATE OR REPLACE VIEW public.partner_bookings AS
SELECT 
  b.id, b.court_id, b.user_id, b.booking_date, b.start_time, b.end_time,
  b.partner_amount, b.payment_status, b.status, b.created_at, b.updated_at
FROM public.bookings b
INNER JOIN public.courts c ON b.court_id = c.id
WHERE c.owner_id = auth.uid() OR c.partner_id IN (
  SELECT id FROM partner_info WHERE user_id = auth.uid()
);