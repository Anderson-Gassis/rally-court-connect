-- Fix Security Definer View issue by removing the problematic view
-- Replace with a simpler approach using direct table queries

DROP VIEW IF EXISTS partner_dashboard;