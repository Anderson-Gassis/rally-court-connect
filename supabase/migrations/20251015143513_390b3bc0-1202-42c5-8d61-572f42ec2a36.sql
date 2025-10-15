-- ========================================
-- CORREÇÃO: Recriar Views sem Security Definer
-- Data: 2025-10-15
-- ========================================

DROP VIEW IF EXISTS public.public_profiles CASCADE;
CREATE VIEW public.public_profiles AS
SELECT 
  user_id, full_name, avatar_url, location, role, skill_level,
  CASE WHEN show_email = true THEN email ELSE NULL END as email,
  CASE WHEN show_phone = true THEN phone ELSE NULL END as phone,
  bio, playing_time, dominant_hand, preferred_surface, ranking_points, ranking_position
FROM public.profiles
WHERE profile_visibility = 'public';

DROP VIEW IF EXISTS public.public_partner_info CASCADE;
CREATE VIEW public.public_partner_info AS
SELECT 
  id, user_id, business_name, description, location, specialization,
  website_url, verified, business_type, business_address,
  contact_email, contact_phone, created_at, updated_at
FROM public.partner_info WHERE verified = true;

DROP VIEW IF EXISTS public.public_tournament_registrations CASCADE;
CREATE VIEW public.public_tournament_registrations AS
SELECT 
  id, tournament_id, user_id, registration_date, payment_status
FROM public.tournament_registrations
WHERE payment_status = 'paid';

DROP VIEW IF EXISTS public.student_class_bookings CASCADE;
CREATE VIEW public.student_class_bookings AS
SELECT 
  id, class_id, student_id, instructor_id, booking_date,
  start_time, end_time, status, payment_status, total_price,
  is_trial, notes, created_at, updated_at
FROM public.class_bookings;

DROP VIEW IF EXISTS public.instructor_class_bookings CASCADE;
CREATE VIEW public.instructor_class_bookings AS
SELECT 
  id, class_id, student_id, instructor_id, booking_date,
  start_time, end_time, status, payment_status, instructor_amount,
  is_trial, notes, created_at, updated_at
FROM public.class_bookings;

DROP VIEW IF EXISTS public.user_bookings CASCADE;
CREATE VIEW public.user_bookings AS
SELECT 
  id, court_id, user_id, booking_date, start_time, end_time,
  total_price, booking_quantity, payment_status, status,
  created_at, updated_at
FROM public.bookings;

DROP VIEW IF EXISTS public.partner_bookings CASCADE;
CREATE VIEW public.partner_bookings AS
SELECT 
  b.id, b.court_id, b.user_id, b.booking_date, b.start_time, b.end_time,
  b.partner_amount, b.payment_status, b.status, b.created_at, b.updated_at
FROM public.bookings b
INNER JOIN public.courts c ON b.court_id = c.id
WHERE c.owner_id = auth.uid() OR c.partner_id IN (
  SELECT id FROM partner_info WHERE user_id = auth.uid()
);