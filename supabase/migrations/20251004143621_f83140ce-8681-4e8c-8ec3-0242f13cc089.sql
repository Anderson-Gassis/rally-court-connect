-- Tabela para pagamentos de planos de instrutores
CREATE TABLE IF NOT EXISTS public.instructor_ad_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  instructor_id UUID REFERENCES public.instructor_info(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  plan_name TEXT NOT NULL CHECK (plan_name IN ('free', 'basic', 'premium')),
  duration_months INTEGER NOT NULL DEFAULT 1 CHECK (duration_months IN (1, 3, 6, 12)),
  discount_percentage NUMERIC DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  stripe_session_id TEXT,
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies para instructor_ad_payments
ALTER TABLE public.instructor_ad_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instrutores podem ver seus pagamentos"
ON public.instructor_ad_payments FOR SELECT
USING (
  user_id = auth.uid() OR
  instructor_id IN (
    SELECT id FROM public.instructor_info WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem criar pagamentos de plano"
ON public.instructor_ad_payments FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Sistema pode atualizar pagamentos"
ON public.instructor_ad_payments FOR UPDATE
USING (true);

-- Índices para performance
CREATE INDEX idx_instructor_ad_payments_user_id ON public.instructor_ad_payments(user_id);
CREATE INDEX idx_instructor_ad_payments_instructor_id ON public.instructor_ad_payments(instructor_id);
CREATE INDEX idx_instructor_ad_payments_payment_status ON public.instructor_ad_payments(payment_status);
CREATE INDEX idx_instructor_ad_payments_created_at ON public.instructor_ad_payments(created_at);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_instructor_ad_payments_updated_at
BEFORE UPDATE ON public.instructor_ad_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();