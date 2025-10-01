-- Adicionar coluna para encerrar inscrições manualmente
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS registration_closed BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.tournaments.registration_closed IS 'Indica se o organizador encerrou as inscrições manualmente antes do prazo';