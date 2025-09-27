-- Fix Security Definer View issue by removing SECURITY DEFINER from view
-- This addresses the linter warning about security definer views

-- Drop and recreate the partner_dashboard view without SECURITY DEFINER
DROP VIEW IF EXISTS partner_dashboard;

-- Create view without SECURITY DEFINER (safer approach)
CREATE VIEW partner_dashboard AS
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
FROM partner_info p
LEFT JOIN courts c ON c.partner_id = p.user_id
LEFT JOIN bookings b ON b.court_id = c.id
WHERE p.user_id = auth.uid()
GROUP BY p.user_id, p.business_name, p.verified;