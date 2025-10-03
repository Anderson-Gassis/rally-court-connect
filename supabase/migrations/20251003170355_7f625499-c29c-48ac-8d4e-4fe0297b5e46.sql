-- Adicionar campo para armazenar ID de estorno
ALTER TABLE public.tournament_registrations
ADD COLUMN IF NOT EXISTS refund_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

COMMENT ON COLUMN public.tournament_registrations.refund_id IS 'ID do estorno do Stripe';
COMMENT ON COLUMN public.tournament_registrations.stripe_payment_intent_id IS 'ID do payment intent do Stripe para processamento de estornos';