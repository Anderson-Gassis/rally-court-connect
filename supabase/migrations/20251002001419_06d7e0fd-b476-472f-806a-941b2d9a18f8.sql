-- Enable RLS on tournament_brackets if not already enabled
ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;

-- Policy to allow tournament organizers to insert bracket matches
CREATE POLICY "Tournament organizers can insert brackets"
ON tournament_brackets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = tournament_brackets.tournament_id
    AND tournaments.organizer_id = auth.uid()
  )
);

-- Policy to allow everyone to view brackets
CREATE POLICY "Everyone can view tournament brackets"
ON tournament_brackets
FOR SELECT
TO public
USING (true);

-- Policy to allow tournament organizers to update brackets
CREATE POLICY "Tournament organizers can update brackets"
ON tournament_brackets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = tournament_brackets.tournament_id
    AND tournaments.organizer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = tournament_brackets.tournament_id
    AND tournaments.organizer_id = auth.uid()
  )
);

-- Policy to allow tournament organizers to delete brackets
CREATE POLICY "Tournament organizers can delete brackets"
ON tournament_brackets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = tournament_brackets.tournament_id
    AND tournaments.organizer_id = auth.uid()
  )
);