import { supabase } from "@/integrations/supabase/client";

export interface League {
  id: string;
  name: string;
  description?: string;
  sport_type: string;
  rules?: string;
  admin_id: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface LeagueTournament {
  id: string;
  league_id: string;
  name: string;
  description?: string;
  tournament_type: 'knockout' | 'round_robin' | 'league';
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  created_at: string;
}

export interface LeagueRanking {
  id: string;
  league_id: string;
  user_id: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  matches_played: number;
  user?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const createLeague = async (league: {
  name: string;
  description?: string;
  sport_type: string;
  rules?: string;
  is_private?: boolean;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('leagues')
    .insert({
      ...league,
      admin_id: user.id,
      is_private: league.is_private ?? true
    })
    .select()
    .single();

  if (error) throw error;

  // Adicionar admin como membro
  await supabase
    .from('league_members')
    .insert({
      league_id: data.id,
      user_id: user.id,
      role: 'admin'
    });

  return data;
};

export const getMyLeagues = async () => {
  const { data, error } = await supabase
    .from('league_members')
    .select(`
      *,
      league:leagues(*)
    `)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getLeagueDetails = async (leagueId: string) => {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', leagueId)
    .single();

  if (error) throw error;
  return data;
};

export const getLeagueMembers = async (leagueId: string) => {
  const { data, error } = await supabase
    .from('league_members')
    .select(`
      *,
      user:profiles!league_members_user_id_fkey(
        user_id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('league_id', leagueId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const inviteToLeague = async (leagueId: string, inviteeId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('league_invitations')
    .insert({
      league_id: leagueId,
      inviter_id: user.id,
      invitee_id: inviteeId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getLeagueInvitations = async () => {
  const { data, error } = await supabase
    .from('league_invitations')
    .select(`
      *,
      league:leagues(*),
      inviter:profiles!league_invitations_inviter_id_fkey(full_name, avatar_url)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const respondToLeagueInvitation = async (
  invitationId: string,
  status: 'accepted' | 'rejected'
) => {
  const { data, error } = await supabase
    .from('league_invitations')
    .update({ status })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) throw error;

  // Se aceito, adicionar como membro
  if (status === 'accepted') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    await supabase
      .from('league_members')
      .insert({
        league_id: data.league_id,
        user_id: user.id,
        role: 'member'
      });
  }

  return data;
};

export const createLeagueTournament = async (tournament: {
  league_id: string;
  name: string;
  description?: string;
  tournament_type: 'knockout' | 'round_robin' | 'league';
  start_date: string;
  end_date: string;
}) => {
  const { data, error } = await supabase
    .from('league_tournaments')
    .insert(tournament)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getLeagueTournaments = async (leagueId: string) => {
  const { data, error } = await supabase
    .from('league_tournaments')
    .select('*')
    .eq('league_id', leagueId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data;
};

export const getLeagueRanking = async (leagueId: string) => {
  const { data, error } = await supabase
    .from('league_rankings')
    .select(`
      *,
      user:profiles!league_rankings_user_id_fkey(full_name, avatar_url)
    `)
    .eq('league_id', leagueId)
    .order('points', { ascending: false })
    .order('wins', { ascending: false });

  if (error) throw error;
  return data;
};

export const addTournamentParticipants = async (
  tournamentId: string,
  userIds: string[]
) => {
  const participants = userIds.map(userId => ({
    tournament_id: tournamentId,
    user_id: userId
  }));

  const { data, error } = await supabase
    .from('league_tournament_participants')
    .insert(participants)
    .select();

  if (error) throw error;
  return data;
};

export const createTournamentMatch = async (match: {
  tournament_id: string;
  player1_id: string;
  player2_id: string;
  match_date?: string;
}) => {
  const { data, error } = await supabase
    .from('league_tournament_matches')
    .insert(match)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateMatchResult = async (
  matchId: string,
  result: {
    player1_score: number;
    player2_score: number;
    winner_id: string;
    status: 'completed';
  }
) => {
  const { data, error } = await supabase
    .from('league_tournament_matches')
    .update(result)
    .eq('id', matchId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTournamentMatches = async (tournamentId: string) => {
  const { data, error } = await supabase
    .from('league_tournament_matches')
    .select(`
      *,
      player1:profiles!league_tournament_matches_player1_id_fkey(full_name, avatar_url),
      player2:profiles!league_tournament_matches_player2_id_fkey(full_name, avatar_url)
    `)
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};