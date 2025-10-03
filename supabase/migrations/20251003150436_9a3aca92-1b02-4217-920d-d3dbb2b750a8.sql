-- Criar função security definer para verificar se usuário é membro de uma liga
CREATE OR REPLACE FUNCTION public.is_league_member(_user_id uuid, _league_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.league_members
    WHERE user_id = _user_id
      AND league_id = _league_id
  )
$$;

-- Remover política antiga que causa recursão
DROP POLICY IF EXISTS "Membros podem ver membros de suas ligas" ON public.league_members;

-- Criar nova política usando a função security definer
CREATE POLICY "Membros podem ver membros de suas ligas"
ON public.league_members
FOR SELECT
TO authenticated
USING (public.is_league_member(auth.uid(), league_id));