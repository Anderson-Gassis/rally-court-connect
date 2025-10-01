-- Enable realtime for tournament_registrations table
ALTER TABLE public.tournament_registrations REPLICA IDENTITY FULL;

-- Add table to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'tournament_registrations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_registrations;
  END IF;
END $$;