-- Tabela para gerenciar a disponibilidade de horários dos instrutores
CREATE TABLE IF NOT EXISTS public.instructor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.instructor_info(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Domingo, 6 = Sábado
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_instructor_availability_instructor ON public.instructor_availability(instructor_id);
CREATE INDEX IF NOT EXISTS idx_instructor_availability_day ON public.instructor_availability(day_of_week);

-- RLS policies
ALTER TABLE public.instructor_availability ENABLE ROW LEVEL SECURITY;

-- Instrutores podem ver sua própria disponibilidade
CREATE POLICY "Instrutores podem ver sua disponibilidade"
ON public.instructor_availability
FOR SELECT
USING (
  instructor_id IN (
    SELECT id FROM instructor_info WHERE user_id = auth.uid()
  )
);

-- Instrutores podem gerenciar sua disponibilidade
CREATE POLICY "Instrutores podem criar sua disponibilidade"
ON public.instructor_availability
FOR INSERT
WITH CHECK (
  instructor_id IN (
    SELECT id FROM instructor_info WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Instrutores podem atualizar sua disponibilidade"
ON public.instructor_availability
FOR UPDATE
USING (
  instructor_id IN (
    SELECT id FROM instructor_info WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Instrutores podem deletar sua disponibilidade"
ON public.instructor_availability
FOR DELETE
USING (
  instructor_id IN (
    SELECT id FROM instructor_info WHERE user_id = auth.uid()
  )
);

-- Todos podem visualizar disponibilidade para agendar aulas
CREATE POLICY "Disponibilidade é pública para agendamento"
ON public.instructor_availability
FOR SELECT
USING (is_available = true);

-- Tabela para bloqueios específicos de horários (compromissos particulares)
CREATE TABLE IF NOT EXISTS public.instructor_blocked_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.instructor_info(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_blocked_time_range CHECK (end_time > start_time)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_blocked_times_instructor ON public.instructor_blocked_times(instructor_id);
CREATE INDEX IF NOT EXISTS idx_blocked_times_date ON public.instructor_blocked_times(blocked_date);

-- RLS policies para bloqueios
ALTER TABLE public.instructor_blocked_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instrutores podem ver seus bloqueios"
ON public.instructor_blocked_times
FOR SELECT
USING (
  instructor_id IN (
    SELECT id FROM instructor_info WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Instrutores podem criar bloqueios"
ON public.instructor_blocked_times
FOR INSERT
WITH CHECK (
  instructor_id IN (
    SELECT id FROM instructor_info WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Instrutores podem deletar bloqueios"
ON public.instructor_blocked_times
FOR DELETE
USING (
  instructor_id IN (
    SELECT id FROM instructor_info WHERE user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_instructor_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_instructor_availability_timestamp
BEFORE UPDATE ON public.instructor_availability
FOR EACH ROW
EXECUTE FUNCTION update_instructor_availability_updated_at();