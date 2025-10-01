-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to send booking reminders every hour
SELECT cron.schedule(
  'send-booking-reminders-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://otiqpklbednbytyvaoah.supabase.co/functions/v1/send-booking-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aXFwa2xiZWRuYnl0eXZhb2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NDQ0NDUsImV4cCI6MjA3NDQyMDQ0NX0.F8ZR80ge_3AUnh7Ei5K-qrOq1EvqhTq-f5_s0AZI34I"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);