-- Adicionar coluna tournament_code para identificação única de torneios
ALTER TABLE public.tournaments 
ADD COLUMN tournament_code text UNIQUE;

-- Criar índice para busca rápida por código
CREATE INDEX idx_tournaments_tournament_code ON public.tournaments(tournament_code);

-- Função para gerar código único de torneio
CREATE OR REPLACE FUNCTION generate_tournament_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Gera código no formato TRN-XXXX (ex: TRN-A1B2)
    new_code := 'TRN-' || upper(substring(md5(random()::text) from 1 for 4));
    
    -- Verifica se o código já existe
    SELECT EXISTS(SELECT 1 FROM tournaments WHERE tournament_code = new_code) INTO code_exists;
    
    -- Se não existir, retorna o código
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Trigger para gerar código automaticamente ao criar torneio
CREATE OR REPLACE FUNCTION set_tournament_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tournament_code IS NULL THEN
    NEW.tournament_code := generate_tournament_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_tournament_code
BEFORE INSERT ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION set_tournament_code();

-- Gerar códigos para torneios existentes
UPDATE public.tournaments
SET tournament_code = generate_tournament_code()
WHERE tournament_code IS NULL;