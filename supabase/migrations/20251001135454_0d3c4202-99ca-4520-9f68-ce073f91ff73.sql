-- Create a cron job to send challenge reminders every hour
SELECT cron.schedule(
  'send-challenge-reminders-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://otiqpklbednbytyvaoah.supabase.co/functions/v1/send-challenge-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90aXFwa2xiZWRuYnl0eXZhb2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NDQ0NDUsImV4cCI6MjA3NDQyMDQ0NX0.F8ZR80ge_3AUnh7Ei5K-qrOq1EvqhTq-f5_s0AZI34I"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);