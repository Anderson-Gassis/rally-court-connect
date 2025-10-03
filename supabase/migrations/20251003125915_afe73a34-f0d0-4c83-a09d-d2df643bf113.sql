-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de solicitações de amizade
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Tabela de amizades confirmadas
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Tabela de ligas
CREATE TABLE IF NOT EXISTS public.leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sport_type TEXT NOT NULL,
  rules TEXT,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de membros de liga
CREATE TABLE IF NOT EXISTS public.league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(league_id, user_id)
);

-- Tabela de convites para liga
CREATE TABLE IF NOT EXISTS public.league_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(league_id, invitee_id)
);

-- Tabela de torneios de liga
CREATE TABLE IF NOT EXISTS public.league_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tournament_type TEXT NOT NULL CHECK (tournament_type IN ('knockout', 'round_robin', 'league')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de participantes de torneio de liga
CREATE TABLE IF NOT EXISTS public.league_tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.league_tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Tabela de jogos de torneio de liga
CREATE TABLE IF NOT EXISTS public.league_tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.league_tournaments(id) ON DELETE CASCADE,
  player1_id UUID NOT NULL REFERENCES auth.users(id),
  player2_id UUID NOT NULL REFERENCES auth.users(id),
  player1_score INTEGER,
  player2_score INTEGER,
  winner_id UUID REFERENCES auth.users(id),
  match_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de rankings de liga
CREATE TABLE IF NOT EXISTS public.league_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(league_id, user_id)
);

-- Atualizar tabela de profiles para privacidade
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'friends' CHECK (profile_visibility IN ('public', 'friends', 'private')),
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_league_members_league ON public.league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_league_members_user ON public.league_members(user_id);
CREATE INDEX IF NOT EXISTS idx_league_invitations_invitee ON public.league_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_league_rankings_league ON public.league_rankings(league_id);
CREATE INDEX IF NOT EXISTS idx_league_tournament_matches_tournament ON public.league_tournament_matches(tournament_id);

-- Habilitar RLS
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_rankings ENABLE ROW LEVEL SECURITY;

-- RLS Policies para friend_requests
CREATE POLICY "Usuários podem ver solicitações enviadas por eles"
  ON public.friend_requests FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Usuários podem ver solicitações recebidas"
  ON public.friend_requests FOR SELECT
  USING (auth.uid() = receiver_id);

CREATE POLICY "Usuários podem criar solicitações"
  ON public.friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receptores podem atualizar solicitações"
  ON public.friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

-- RLS Policies para friendships
CREATE POLICY "Usuários podem ver suas amizades"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Sistema pode criar amizades"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas amizades"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies para leagues
CREATE POLICY "Ligas públicas são visíveis para todos"
  ON public.leagues FOR SELECT
  USING (is_private = false);

CREATE POLICY "Membros podem ver suas ligas privadas"
  ON public.leagues FOR SELECT
  USING (
    is_private = true AND (
      auth.uid() = admin_id OR
      EXISTS (
        SELECT 1 FROM public.league_members
        WHERE league_id = leagues.id AND user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Usuários autenticados podem criar ligas"
  ON public.leagues FOR INSERT
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins podem atualizar suas ligas"
  ON public.leagues FOR UPDATE
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins podem deletar suas ligas"
  ON public.leagues FOR DELETE
  USING (auth.uid() = admin_id);

-- RLS Policies para league_members
CREATE POLICY "Membros podem ver membros de suas ligas"
  ON public.league_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members lm
      WHERE lm.league_id = league_members.league_id AND lm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem adicionar membros"
  ON public.league_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leagues
      WHERE id = league_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem remover membros"
  ON public.league_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.leagues
      WHERE id = league_id AND admin_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- RLS Policies para league_invitations
CREATE POLICY "Convidados podem ver seus convites"
  ON public.league_invitations FOR SELECT
  USING (auth.uid() = invitee_id);

CREATE POLICY "Membros podem ver convites de suas ligas"
  ON public.league_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_id = league_invitations.league_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Membros podem criar convites"
  ON public.league_invitations FOR INSERT
  WITH CHECK (
    auth.uid() = inviter_id AND
    EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_id = league_invitations.league_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Convidados podem atualizar seus convites"
  ON public.league_invitations FOR UPDATE
  USING (auth.uid() = invitee_id);

-- RLS Policies para league_tournaments
CREATE POLICY "Membros podem ver torneios de suas ligas"
  ON public.league_tournaments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_id = league_tournaments.league_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem criar torneios"
  ON public.league_tournaments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leagues
      WHERE id = league_id AND admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem atualizar torneios"
  ON public.league_tournaments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.leagues
      WHERE id = league_id AND admin_id = auth.uid()
    )
  );

-- RLS Policies para league_tournament_participants
CREATE POLICY "Participantes podem ver participantes"
  ON public.league_tournament_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.league_tournament_participants ltp
      INNER JOIN public.league_tournaments lt ON ltp.tournament_id = lt.id
      INNER JOIN public.league_members lm ON lt.league_id = lm.league_id
      WHERE lm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem adicionar participantes"
  ON public.league_tournament_participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.league_tournaments lt
      INNER JOIN public.leagues l ON lt.league_id = l.id
      WHERE lt.id = tournament_id AND l.admin_id = auth.uid()
    )
  );

-- RLS Policies para league_tournament_matches
CREATE POLICY "Participantes podem ver jogos"
  ON public.league_tournament_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.league_tournaments lt
      INNER JOIN public.league_members lm ON lt.league_id = lm.league_id
      WHERE lt.id = tournament_id AND lm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem criar jogos"
  ON public.league_tournament_matches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.league_tournaments lt
      INNER JOIN public.leagues l ON lt.league_id = l.id
      WHERE lt.id = tournament_id AND l.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem atualizar resultados"
  ON public.league_tournament_matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.league_tournaments lt
      INNER JOIN public.leagues l ON lt.league_id = l.id
      WHERE lt.id = tournament_id AND l.admin_id = auth.uid()
    )
  );

-- RLS Policies para league_rankings
CREATE POLICY "Membros podem ver rankings de suas ligas"
  ON public.league_rankings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_id = league_rankings.league_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema pode atualizar rankings"
  ON public.league_rankings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sistema pode modificar rankings"
  ON public.league_rankings FOR UPDATE
  USING (true);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leagues_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_league_invitations_updated_at
  BEFORE UPDATE ON public.league_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_league_tournaments_updated_at
  BEFORE UPDATE ON public.league_tournaments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_league_tournament_matches_updated_at
  BEFORE UPDATE ON public.league_tournament_matches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_league_rankings_updated_at
  BEFORE UPDATE ON public.league_rankings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar amizade bidirecional quando aceita
CREATE OR REPLACE FUNCTION public.create_friendship_on_accept()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Criar amizade bidirecional
    INSERT INTO public.friendships (user_id, friend_id)
    VALUES (NEW.sender_id, NEW.receiver_id), (NEW.receiver_id, NEW.sender_id)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER friend_request_accepted
  AFTER UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_friendship_on_accept();

-- Função para atualizar ranking quando resultado é registrado
CREATE OR REPLACE FUNCTION public.update_league_ranking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_league_id UUID;
  v_points_win INTEGER := 3;
  v_points_draw INTEGER := 1;
BEGIN
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL THEN
    -- Obter league_id
    SELECT lt.league_id INTO v_league_id
    FROM public.league_tournaments lt
    WHERE lt.id = NEW.tournament_id;

    -- Atualizar ou inserir ranking para os jogadores
    -- Jogador 1
    INSERT INTO public.league_rankings (league_id, user_id, points, wins, draws, losses, matches_played)
    VALUES (
      v_league_id,
      NEW.player1_id,
      CASE 
        WHEN NEW.winner_id = NEW.player1_id THEN v_points_win
        WHEN NEW.player1_score = NEW.player2_score THEN v_points_draw
        ELSE 0
      END,
      CASE WHEN NEW.winner_id = NEW.player1_id THEN 1 ELSE 0 END,
      CASE WHEN NEW.player1_score = NEW.player2_score THEN 1 ELSE 0 END,
      CASE WHEN NEW.winner_id = NEW.player2_id THEN 1 ELSE 0 END,
      1
    )
    ON CONFLICT (league_id, user_id) DO UPDATE SET
      points = league_rankings.points + CASE 
        WHEN NEW.winner_id = NEW.player1_id THEN v_points_win
        WHEN NEW.player1_score = NEW.player2_score THEN v_points_draw
        ELSE 0
      END,
      wins = league_rankings.wins + CASE WHEN NEW.winner_id = NEW.player1_id THEN 1 ELSE 0 END,
      draws = league_rankings.draws + CASE WHEN NEW.player1_score = NEW.player2_score THEN 1 ELSE 0 END,
      losses = league_rankings.losses + CASE WHEN NEW.winner_id = NEW.player2_id THEN 1 ELSE 0 END,
      matches_played = league_rankings.matches_played + 1,
      updated_at = now();

    -- Jogador 2
    INSERT INTO public.league_rankings (league_id, user_id, points, wins, draws, losses, matches_played)
    VALUES (
      v_league_id,
      NEW.player2_id,
      CASE 
        WHEN NEW.winner_id = NEW.player2_id THEN v_points_win
        WHEN NEW.player1_score = NEW.player2_score THEN v_points_draw
        ELSE 0
      END,
      CASE WHEN NEW.winner_id = NEW.player2_id THEN 1 ELSE 0 END,
      CASE WHEN NEW.player1_score = NEW.player2_score THEN 1 ELSE 0 END,
      CASE WHEN NEW.winner_id = NEW.player1_id THEN 1 ELSE 0 END,
      1
    )
    ON CONFLICT (league_id, user_id) DO UPDATE SET
      points = league_rankings.points + CASE 
        WHEN NEW.winner_id = NEW.player2_id THEN v_points_win
        WHEN NEW.player1_score = NEW.player2_score THEN v_points_draw
        ELSE 0
      END,
      wins = league_rankings.wins + CASE WHEN NEW.winner_id = NEW.player2_id THEN 1 ELSE 0 END,
      draws = league_rankings.draws + CASE WHEN NEW.player1_score = NEW.player2_score THEN 1 ELSE 0 END,
      losses = league_rankings.losses + CASE WHEN NEW.winner_id = NEW.player1_id THEN 1 ELSE 0 END,
      matches_played = league_rankings.matches_played + 1,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER league_match_completed
  AFTER UPDATE ON public.league_tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_league_ranking();