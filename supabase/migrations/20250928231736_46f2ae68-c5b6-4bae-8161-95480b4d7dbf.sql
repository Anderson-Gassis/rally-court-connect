-- Melhorar a função handle_new_user para tratar duplicatas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se já existe um perfil para este usuário
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    RETURN NEW; -- Usuário já tem perfil, não criar duplicata
  END IF;
  
  -- Inserir novo perfil
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'player'::user_role)
  )
  ON CONFLICT (user_id) DO NOTHING; -- Ignorar se já existe
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se houver violação de unicidade, apenas retornar sem falhar
    RETURN NEW;
END;
$$;

-- Criar função para prevenir criação de contas com emails duplicados (se não existir)
CREATE OR REPLACE FUNCTION public.prevent_duplicate_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o email já existe (ignorar null/empty)
  IF NEW.email IS NOT NULL AND trim(NEW.email) != '' THEN
    IF EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE email = NEW.email 
      AND user_id != NEW.user_id
    ) THEN
      RAISE EXCEPTION 'Email já está em uso por outro usuário'
        USING ERRCODE = 'unique_violation';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para verificar email duplicado (se não existir)
DROP TRIGGER IF EXISTS prevent_duplicate_email_trigger ON public.profiles;
CREATE TRIGGER prevent_duplicate_email_trigger
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_email();