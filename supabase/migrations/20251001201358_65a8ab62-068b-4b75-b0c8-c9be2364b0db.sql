-- Adicionar novas colunas à tabela tournaments
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS modalities TEXT[] DEFAULT ARRAY['singles'],
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT ARRAY['A'],
ADD COLUMN IF NOT EXISTS regulation TEXT,
ADD COLUMN IF NOT EXISTS registration_start_date DATE,
ADD COLUMN IF NOT EXISTS bracket_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS points_distribution JSONB DEFAULT '{"champion": 125, "finalist": 64, "semifinalist": 35, "quarterfinals": 16, "round_of_16": 8}';

-- Criar tabela de chaves (brackets)
CREATE TABLE IF NOT EXISTS tournament_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round TEXT NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id UUID REFERENCES profiles(user_id),
  player2_id UUID REFERENCES profiles(user_id),
  player1_score TEXT,
  player2_score TEXT,
  winner_id UUID REFERENCES profiles(user_id),
  status TEXT DEFAULT 'pending',
  scheduled_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, round, match_number)
);

-- Criar tabela de comentários de partidas
CREATE TABLE IF NOT EXISTS match_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES tournament_brackets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de conquistas/medalhas
CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tournament_id UUID REFERENCES tournaments(id)
);

-- Criar tabela para encontrar parceiros
CREATE TABLE IF NOT EXISTS partner_search (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  title TEXT NOT NULL,
  description TEXT,
  sport_type TEXT NOT NULL,
  skill_level TEXT,
  location TEXT,
  preferred_date DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar ranking aos perfis
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ranking_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ranking_position INTEGER;

-- Atualizar tournament_registrations com mais informações
ALTER TABLE tournament_registrations
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS modality TEXT,
ADD COLUMN IF NOT EXISTS partner_user_id UUID REFERENCES profiles(user_id),
ADD COLUMN IF NOT EXISTS seed_position INTEGER,
ADD COLUMN IF NOT EXISTS validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS validation_notes TEXT;

-- Enable RLS nas novas tabelas
ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_search ENABLE ROW LEVEL SECURITY;

-- Drop políticas existentes se existirem
DROP POLICY IF EXISTS "Chaves são visíveis para todos" ON tournament_brackets;
DROP POLICY IF EXISTS "Jogadores podem atualizar resultados de suas partidas" ON tournament_brackets;
DROP POLICY IF EXISTS "Comentários são visíveis para todos" ON match_comments;
DROP POLICY IF EXISTS "Usuários autenticados podem comentar" ON match_comments;
DROP POLICY IF EXISTS "Usuários podem deletar seus comentários" ON match_comments;
DROP POLICY IF EXISTS "Conquistas são visíveis para todos" ON player_achievements;
DROP POLICY IF EXISTS "Sistema pode criar conquistas" ON player_achievements;
DROP POLICY IF EXISTS "Anúncios são visíveis para todos autenticados" ON partner_search;
DROP POLICY IF EXISTS "Usuários podem criar seus anúncios" ON partner_search;
DROP POLICY IF EXISTS "Usuários podem atualizar seus anúncios" ON partner_search;
DROP POLICY IF EXISTS "Usuários podem deletar seus anúncios" ON partner_search;

-- Políticas de RLS para tournament_brackets
CREATE POLICY "Chaves são visíveis para todos"
ON tournament_brackets FOR SELECT
USING (true);

CREATE POLICY "Jogadores podem atualizar resultados de suas partidas"
ON tournament_brackets FOR UPDATE
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Políticas de RLS para match_comments
CREATE POLICY "Comentários são visíveis para todos"
ON match_comments FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem comentar"
ON match_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus comentários"
ON match_comments FOR DELETE
USING (auth.uid() = user_id);

-- Políticas de RLS para player_achievements
CREATE POLICY "Conquistas são visíveis para todos"
ON player_achievements FOR SELECT
USING (true);

CREATE POLICY "Sistema pode criar conquistas"
ON player_achievements FOR INSERT
WITH CHECK (true);

-- Políticas de RLS para partner_search
CREATE POLICY "Anúncios são visíveis para todos autenticados"
ON partner_search FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem criar seus anúncios"
ON partner_search FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus anúncios"
ON partner_search FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus anúncios"
ON partner_search FOR DELETE
USING (auth.uid() = user_id);