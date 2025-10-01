import { supabase } from '@/integrations/supabase/client';

export interface MatchHistory {
  id?: string;
  player_id: string;
  opponent_id?: string | null;
  opponent_name: string;
  match_date: string;
  result: 'vitória' | 'derrota';
  score?: string | null;
  sport_type: string;
  court_name?: string | null;
  duration_minutes?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MatchStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  favoriteOpponent?: string;
  averageDuration?: number;
}

export const matchHistoryService = {
  async getMatchHistory(playerId: string, limit = 50): Promise<MatchHistory[]> {
    const { data, error } = await supabase
      .from('match_history')
      .select('*')
      .eq('player_id', playerId)
      .order('match_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch match history: ${error.message}`);
    }

    return (data || []).map(match => ({
      ...match,
      result: match.result as 'vitória' | 'derrota'
    }));
  },

  async addMatch(matchData: Omit<MatchHistory, 'id' | 'created_at' | 'updated_at'>): Promise<MatchHistory> {
    const { data, error } = await supabase
      .from('match_history')
      .insert(matchData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add match: ${error.message}`);
    }

    return {
      ...data,
      result: data.result as 'vitória' | 'derrota'
    };
  },

  async updateMatch(matchId: string, matchData: Partial<Omit<MatchHistory, 'id' | 'created_at' | 'updated_at'>>): Promise<MatchHistory> {
    const { data, error } = await supabase
      .from('match_history')
      .update(matchData)
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update match: ${error.message}`);
    }

    return {
      ...data,
      result: data.result as 'vitória' | 'derrota'
    };
  },

  async deleteMatch(matchId: string): Promise<void> {
    const { error } = await supabase
      .from('match_history')
      .delete()
      .eq('id', matchId);

    if (error) {
      throw new Error(`Failed to delete match: ${error.message}`);
    }
  },

  async getMatchStats(playerId: string): Promise<MatchStats> {
    const matches = await this.getMatchHistory(playerId);
    
    const totalMatches = matches.length;
    const wins = matches.filter(match => match.result === 'vitória').length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    // Find most frequent opponent
    const opponentCounts: Record<string, number> = {};
    matches.forEach(match => {
      opponentCounts[match.opponent_name] = (opponentCounts[match.opponent_name] || 0) + 1;
    });
    
    const favoriteOpponent = Object.keys(opponentCounts).reduce((a, b) => 
      opponentCounts[a] > opponentCounts[b] ? a : b, ''
    );

    // Calculate average duration
    const matchesWithDuration = matches.filter(match => match.duration_minutes);
    const averageDuration = matchesWithDuration.length > 0
      ? matchesWithDuration.reduce((sum, match) => sum + (match.duration_minutes || 0), 0) / matchesWithDuration.length
      : undefined;

    return {
      totalMatches,
      wins,
      losses,
      winRate: Math.round(winRate),
      favoriteOpponent: favoriteOpponent || undefined,
      averageDuration: averageDuration ? Math.round(averageDuration) : undefined,
    };
  },

  async getHeadToHead(player1Id: string, player2Id: string): Promise<{
    player1Wins: number;
    player2Wins: number;
    totalMatches: number;
  }> {
    // Get matches where player1 played against player2
    const { data: player1Matches, error: error1 } = await supabase
      .from('match_history')
      .select('result')
      .eq('player_id', player1Id)
      .eq('opponent_id', player2Id);

    // Get matches where player2 played against player1
    const { data: player2Matches, error: error2 } = await supabase
      .from('match_history')
      .select('result')
      .eq('player_id', player2Id)
      .eq('opponent_id', player1Id);

    if (error1 || error2) {
      throw new Error('Failed to fetch head-to-head data');
    }

    const player1Wins = (player1Matches || []).filter(match => match.result === 'vitória').length +
                       (player2Matches || []).filter(match => match.result === 'derrota').length;

    const player2Wins = (player2Matches || []).filter(match => match.result === 'vitória').length +
                       (player1Matches || []).filter(match => match.result === 'derrota').length;

    const totalMatches = (player1Matches?.length || 0) + (player2Matches?.length || 0);

    return {
      player1Wins,
      player2Wins,
      totalMatches,
    };
  }
};