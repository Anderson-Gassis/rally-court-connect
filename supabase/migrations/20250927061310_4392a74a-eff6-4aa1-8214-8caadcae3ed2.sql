-- Adicionar novos campos ao perfil do jogador
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS playing_time TEXT,
ADD COLUMN IF NOT EXISTS dominant_hand TEXT CHECK (dominant_hand IN ('destro', 'canhoto')),
ADD COLUMN IF NOT EXISTS preferred_surface TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS favorite_courts TEXT[];

-- Criar tabela para histórico de partidas
CREATE TABLE IF NOT EXISTS public.match_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  opponent_name TEXT NOT NULL,
  match_date DATE NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('vitoria', 'derrota')),
  score TEXT,
  sport_type TEXT NOT NULL,
  court_name TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de histórico de partidas
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para histórico de partidas
CREATE POLICY "Users can view their own match history" 
ON public.match_history 
FOR SELECT 
USING (auth.uid() = player_id);

CREATE POLICY "Users can create their own match history" 
ON public.match_history 
FOR INSERT 
WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update their own match history" 
ON public.match_history 
FOR UPDATE 
USING (auth.uid() = player_id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_match_history_updated_at
BEFORE UPDATE ON public.match_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar storage bucket para fotos de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para fotos de perfil
CREATE POLICY "Profile photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photo" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photo" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);