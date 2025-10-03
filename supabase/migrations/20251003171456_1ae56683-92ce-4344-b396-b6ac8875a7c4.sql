-- Adicionar campo de horário de início das inscrições
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS registration_start_time TIME WITHOUT TIME ZONE DEFAULT '00:00';