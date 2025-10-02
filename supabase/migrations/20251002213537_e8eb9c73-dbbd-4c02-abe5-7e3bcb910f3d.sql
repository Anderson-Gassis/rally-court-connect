-- Criar tabela de reviews/avaliações
CREATE TABLE public.court_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_court_reviews_court_id ON public.court_reviews(court_id);
CREATE INDEX idx_court_reviews_user_id ON public.court_reviews(user_id);
CREATE INDEX idx_court_reviews_created_at ON public.court_reviews(created_at DESC);

-- Prevenir reviews duplicados do mesmo usuário para a mesma quadra
CREATE UNIQUE INDEX idx_court_reviews_unique_user_court ON public.court_reviews(court_id, user_id);

-- Enable RLS
ALTER TABLE public.court_reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reviews são visíveis para todos"
  ON public.court_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Usuários autenticados podem criar reviews"
  ON public.court_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios reviews"
  ON public.court_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios reviews"
  ON public.court_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_court_reviews_updated_at
  BEFORE UPDATE ON public.court_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular rating médio e atualizar tabela courts
CREATE OR REPLACE FUNCTION public.update_court_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.courts
  SET rating = (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
    FROM public.court_reviews
    WHERE court_id = COALESCE(NEW.court_id, OLD.court_id)
  )
  WHERE id = COALESCE(NEW.court_id, OLD.court_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers para atualizar rating automaticamente
CREATE TRIGGER trigger_update_court_rating_on_insert
  AFTER INSERT ON public.court_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_court_rating();

CREATE TRIGGER trigger_update_court_rating_on_update
  AFTER UPDATE ON public.court_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_court_rating();

CREATE TRIGGER trigger_update_court_rating_on_delete
  AFTER DELETE ON public.court_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_court_rating();