-- Criar função para obter estatísticas de usuários (não precisa de RLS)
CREATE OR REPLACE FUNCTION public.get_user_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_users', COUNT(*),
    'total_players', COUNT(*) FILTER (WHERE role = 'player'),
    'total_partners', COUNT(*) FILTER (WHERE role = 'partner'),
    'new_users_30_days', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'new_users_7_days', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_users_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)
  )
  FROM public.profiles;
$$;

-- Criar tabela para logs de atividade 
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type text NOT NULL, -- 'login', 'register', 'court_added', 'booking_made', etc.
  activity_data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- RLS para logs de atividade
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Permitir inserção de logs por usuários autenticados
CREATE POLICY "Users can insert their own activity logs" 
ON public.user_activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Função para registrar atividade do usuário
CREATE OR REPLACE FUNCTION public.log_user_activity(
  activity_type_param text,
  activity_data_param jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_activity_logs (user_id, activity_type, activity_data)
  VALUES (auth.uid(), activity_type_param, activity_data_param);
END;
$$;