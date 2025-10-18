-- Adiciona política para permitir que amigos vejam perfis uns dos outros
CREATE POLICY "Users can view friends' profiles"
ON public.profiles
FOR SELECT
USING (
  profile_visibility = 'friends' 
  AND EXISTS (
    SELECT 1 FROM friendships
    WHERE (user_id = auth.uid() AND friend_id = profiles.user_id)
       OR (friend_id = auth.uid() AND user_id = profiles.user_id)
  )
);