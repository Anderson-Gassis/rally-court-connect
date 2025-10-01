-- Adicionar campo de horário na tabela challenges
ALTER TABLE public.challenges
ADD COLUMN preferred_time time without time zone;