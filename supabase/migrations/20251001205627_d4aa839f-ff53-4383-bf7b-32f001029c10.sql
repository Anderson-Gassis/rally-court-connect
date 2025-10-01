-- Criar tabela de planos de anúncios
CREATE TABLE IF NOT EXISTS public.ad_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'free', 'basic', 'premium'
  display_name TEXT NOT NULL,
  description TEXT,
  visibility_priority INTEGER NOT NULL DEFAULT 0, -- 0=baixa, 1=média, 2=alta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir planos padrão
INSERT INTO public.ad_plans (name, display_name, description, visibility_priority) VALUES
('free', 'Grátis', 'Baixa visibilidade nas pesquisas', 0),
('basic', 'Básico', 'Meio das pesquisas, maior destaque', 1),
('premium', 'Premium', 'Primeiras posições nas pesquisas, máximo destaque', 2);

-- Adicionar campos de plano na tabela partner_search
ALTER TABLE public.partner_search 
ADD COLUMN IF NOT EXISTS ad_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Adicionar campos de plano na tabela courts
ALTER TABLE public.courts
ADD COLUMN IF NOT EXISTS ad_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ad_payment_id TEXT;

-- Adicionar campos de plano na tabela instructor_info  
ALTER TABLE public.instructor_info
ADD COLUMN IF NOT EXISTS ad_plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ad_payment_id TEXT;

-- Criar tabela de pagamentos de anúncios
CREATE TABLE IF NOT EXISTS public.ad_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ad_type TEXT NOT NULL, -- 'court', 'instructor', 'partner_search'
  ad_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ad_plans (público para leitura)
CREATE POLICY "Ad plans são visíveis para todos"
ON public.ad_plans FOR SELECT
USING (true);

-- Políticas RLS para ad_payments
CREATE POLICY "Usuários podem criar seus pagamentos"
ON public.ad_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus pagamentos"
ON public.ad_payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus pagamentos"
ON public.ad_payments FOR UPDATE
USING (auth.uid() = user_id);

COMMENT ON TABLE public.ad_plans IS 'Planos de anúncios disponíveis na plataforma';
COMMENT ON TABLE public.ad_payments IS 'Registro de pagamentos para upgrade de anúncios';
COMMENT ON COLUMN public.partner_search.ad_plan IS 'Plano do anúncio: free, basic ou premium';
COMMENT ON COLUMN public.partner_search.image_url IS 'URL da imagem do anúncio';
COMMENT ON COLUMN public.courts.ad_plan IS 'Plano do anúncio de quadra';
COMMENT ON COLUMN public.instructor_info.ad_plan IS 'Plano do anúncio de professor';