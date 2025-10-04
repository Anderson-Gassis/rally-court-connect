-- Tabela para disponibilidade de horários das quadras
CREATE TABLE IF NOT EXISTS public.court_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Tabela para bloqueios específicos de datas
CREATE TABLE IF NOT EXISTS public.court_blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_blocked_time_range CHECK (end_time > start_time)
);

-- Tabela para créditos de pacotes dos usuários
CREATE TABLE IF NOT EXISTS public.booking_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  court_id UUID NOT NULL REFERENCES public.courts(id) ON DELETE CASCADE,
  total_hours NUMERIC NOT NULL CHECK (total_hours > 0),
  remaining_hours NUMERIC NOT NULL CHECK (remaining_hours >= 0),
  original_booking_id UUID REFERENCES public.bookings(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para atualizar updated_at em court_availability
CREATE OR REPLACE FUNCTION public.update_court_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_court_availability_updated_at
BEFORE UPDATE ON public.court_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_court_availability_updated_at();

-- Trigger para atualizar updated_at em booking_credits
CREATE TRIGGER update_booking_credits_updated_at
BEFORE UPDATE ON public.booking_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para court_availability
ALTER TABLE public.court_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Disponibilidade é pública para visualização"
ON public.court_availability FOR SELECT
USING (is_available = true);

CREATE POLICY "Donos de quadras podem gerenciar disponibilidade"
ON public.court_availability FOR ALL
USING (
  court_id IN (
    SELECT id FROM public.courts WHERE owner_id = auth.uid()
  )
);

-- RLS Policies para court_blocked_times
ALTER TABLE public.court_blocked_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bloqueios são visíveis para agendamento"
ON public.court_blocked_times FOR SELECT
USING (true);

CREATE POLICY "Donos de quadras podem gerenciar bloqueios"
ON public.court_blocked_times FOR ALL
USING (
  court_id IN (
    SELECT id FROM public.courts WHERE owner_id = auth.uid()
  )
);

-- RLS Policies para booking_credits
ALTER TABLE public.booking_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus créditos"
ON public.booking_credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar créditos"
ON public.booking_credits FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar créditos"
ON public.booking_credits FOR UPDATE
USING (true);

-- Índices para performance
CREATE INDEX idx_court_availability_court_id ON public.court_availability(court_id);
CREATE INDEX idx_court_availability_day_of_week ON public.court_availability(day_of_week);
CREATE INDEX idx_court_blocked_times_court_id ON public.court_blocked_times(court_id);
CREATE INDEX idx_court_blocked_times_blocked_date ON public.court_blocked_times(blocked_date);
CREATE INDEX idx_booking_credits_user_id ON public.booking_credits(user_id);
CREATE INDEX idx_booking_credits_court_id ON public.booking_credits(court_id);