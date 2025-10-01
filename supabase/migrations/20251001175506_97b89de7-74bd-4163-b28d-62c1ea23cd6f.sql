-- Atualizar enum user_role para incluir instructor
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'instructor';

-- Criar tabela para informações de instrutores
CREATE TABLE IF NOT EXISTS public.instructor_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  specialization TEXT[], -- Array de especialidades: iniciante, crianças, mulheres, profissional, sparring
  experience_years INTEGER,
  certifications TEXT[],
  hourly_rate NUMERIC NOT NULL DEFAULT 0,
  bio TEXT,
  availability JSONB, -- Horários disponíveis
  location TEXT,
  trial_class_available BOOLEAN DEFAULT true,
  trial_class_price NUMERIC DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para aulas/classes
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructor_info(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  class_type TEXT NOT NULL, -- individual, grupo, experimental
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price NUMERIC NOT NULL,
  max_students INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para reservas de aulas
CREATE TABLE IF NOT EXISTS public.class_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES public.instructor_info(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, refunded
  total_price NUMERIC NOT NULL,
  platform_fee NUMERIC DEFAULT 0,
  instructor_amount NUMERIC DEFAULT 0,
  payment_id TEXT,
  notes TEXT,
  is_trial BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela para estudantes (relacionamento instrutor-aluno)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES public.instructor_info(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT,
  skill_level TEXT,
  goals TEXT,
  total_classes INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(instructor_id, student_user_id)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.instructor_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para instructor_info
CREATE POLICY "Instrutores podem ver seu próprio perfil"
  ON public.instructor_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Instrutores podem atualizar seu próprio perfil"
  ON public.instructor_info FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Instrutores podem criar seu perfil"
  ON public.instructor_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Perfis de instrutores são públicos para visualização"
  ON public.instructor_info FOR SELECT
  USING (true);

-- Políticas RLS para classes
CREATE POLICY "Instrutores podem ver suas próprias aulas"
  ON public.classes FOR SELECT
  USING (instructor_id IN (
    SELECT id FROM public.instructor_info WHERE user_id = auth.uid()
  ));

CREATE POLICY "Instrutores podem criar aulas"
  ON public.classes FOR INSERT
  WITH CHECK (instructor_id IN (
    SELECT id FROM public.instructor_info WHERE user_id = auth.uid()
  ));

CREATE POLICY "Instrutores podem atualizar suas aulas"
  ON public.classes FOR UPDATE
  USING (instructor_id IN (
    SELECT id FROM public.instructor_info WHERE user_id = auth.uid()
  ));

CREATE POLICY "Aulas são públicas para visualização"
  ON public.classes FOR SELECT
  USING (true);

-- Políticas RLS para class_bookings
CREATE POLICY "Instrutores podem ver reservas de suas aulas"
  ON public.class_bookings FOR SELECT
  USING (instructor_id IN (
    SELECT id FROM public.instructor_info WHERE user_id = auth.uid()
  ));

CREATE POLICY "Alunos podem ver suas próprias reservas"
  ON public.class_bookings FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Usuários autenticados podem criar reservas"
  ON public.class_bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Instrutores podem atualizar reservas de suas aulas"
  ON public.class_bookings FOR UPDATE
  USING (instructor_id IN (
    SELECT id FROM public.instructor_info WHERE user_id = auth.uid()
  ));

-- Políticas RLS para students
CREATE POLICY "Instrutores podem ver seus alunos"
  ON public.students FOR SELECT
  USING (instructor_id IN (
    SELECT id FROM public.instructor_info WHERE user_id = auth.uid()
  ));

CREATE POLICY "Instrutores podem adicionar alunos"
  ON public.students FOR INSERT
  WITH CHECK (instructor_id IN (
    SELECT id FROM public.instructor_info WHERE user_id = auth.uid()
  ));

CREATE POLICY "Instrutores podem atualizar informações de seus alunos"
  ON public.students FOR UPDATE
  USING (instructor_id IN (
    SELECT id FROM public.instructor_info WHERE user_id = auth.uid()
  ));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_instructor_info_updated_at
  BEFORE UPDATE ON public.instructor_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_bookings_updated_at
  BEFORE UPDATE ON public.class_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();