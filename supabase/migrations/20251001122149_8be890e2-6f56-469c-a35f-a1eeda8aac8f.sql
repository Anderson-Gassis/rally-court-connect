-- Adicionar campos para sistema de monetização (corrigido)

-- 1. Adicionar campo de destaque nas quadras
ALTER TABLE courts ADD COLUMN IF NOT EXISTS featured_until timestamp with time zone;
ALTER TABLE courts ADD COLUMN IF NOT EXISTS featured_plan text CHECK (featured_plan IN ('semanal', 'quinzenal', 'mensal'));

-- 2. Criar tabela para histórico de pagamentos de destaque
CREATE TABLE IF NOT EXISTS featured_listing_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid REFERENCES courts(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES partner_info(id) ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('semanal', 'quinzenal', 'mensal')),
  price numeric NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_id text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Adicionar campos de comissão nas reservas
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS partner_amount numeric DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_percentage numeric DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_quantity integer DEFAULT 1;

-- 4. Adicionar campos de comissão nos torneios
ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0;
ALTER TABLE tournament_registrations ADD COLUMN IF NOT EXISTS organizer_amount numeric DEFAULT 0;

-- 5. Habilitar RLS
ALTER TABLE featured_listing_payments ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para featured_listing_payments
CREATE POLICY "Partners can view their own featured payments"
  ON featured_listing_payments FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partner_info WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Partners can create featured payments"
  ON featured_listing_payments FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT id FROM partner_info WHERE user_id = auth.uid()
    )
  );

-- 7. Trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_featured_listing_payments_updated_at
  BEFORE UPDATE ON featured_listing_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Índices para performance (sem predicado problemático)
CREATE INDEX IF NOT EXISTS idx_courts_featured_until ON courts(featured_until);
CREATE INDEX IF NOT EXISTS idx_featured_payments_court ON featured_listing_payments(court_id);
CREATE INDEX IF NOT EXISTS idx_featured_payments_partner ON featured_listing_payments(partner_id);