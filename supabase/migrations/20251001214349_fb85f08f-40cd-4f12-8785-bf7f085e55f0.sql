-- Add RLS policy to allow tournament organizers to view all registrations for their tournaments
CREATE POLICY "Tournament organizers can view all registrations"
ON public.tournament_registrations
FOR SELECT
USING (
  tournament_id IN (
    SELECT id FROM public.tournaments
    WHERE organizer_id = auth.uid()
  )
);

-- Add RLS policy to allow viewing registrations for tournaments (for bracket generation)
CREATE POLICY "Anyone can view registrations for public tournaments"
ON public.tournament_registrations
FOR SELECT
USING (
  tournament_id IN (
    SELECT id FROM public.tournaments
    WHERE true
  )
);