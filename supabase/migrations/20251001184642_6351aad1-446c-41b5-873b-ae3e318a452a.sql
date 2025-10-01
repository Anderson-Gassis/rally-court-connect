-- Adicionar foreign keys na tabela challenges para conectar com profiles
ALTER TABLE public.challenges
ADD CONSTRAINT challenges_challenger_id_fkey 
FOREIGN KEY (challenger_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.challenges
ADD CONSTRAINT challenges_challenged_id_fkey 
FOREIGN KEY (challenged_id) REFERENCES auth.users(id) ON DELETE CASCADE;