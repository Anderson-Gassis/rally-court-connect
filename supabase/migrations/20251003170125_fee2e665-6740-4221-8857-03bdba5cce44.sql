-- Adicionar campos para horário de encerramento e status de cancelamento
ALTER TABLE public.tournaments
ADD COLUMN IF NOT EXISTS registration_deadline_time time without time zone DEFAULT '23:59:59',
ADD COLUMN IF NOT EXISTS cancelled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;

-- Comentários para documentação
COMMENT ON COLUMN public.tournaments.registration_deadline_time IS 'Horário limite para encerramento das inscrições';
COMMENT ON COLUMN public.tournaments.cancelled IS 'Indica se o torneio foi cancelado';
COMMENT ON COLUMN public.tournaments.cancellation_reason IS 'Motivo do cancelamento do torneio';
COMMENT ON COLUMN public.tournaments.cancelled_at IS 'Data e hora do cancelamento';