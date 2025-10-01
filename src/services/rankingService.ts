import { supabase } from '@/integrations/supabase/client';
import { matchHistoryService } from './matchHistoryService';

export const rankingService = {
  /**
   * Update player ranking points based on match result
   */
  async updateRankingFromMatch(
    playerId: string, 
    result: 'vitória' | 'derrota',
    matchType: 'challenge' | 'tournament' = 'challenge'
  ): Promise<void> {
    try {
      // Get current ranking points
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('ranking_points')
        .eq('user_id', playerId)
        .single();

      if (profileError) throw profileError;

      // Calculate points based on result and match type
      let pointsToAdd = 0;
      if (result === 'vitória') {
        pointsToAdd = matchType === 'tournament' ? 15 : 10;
      } else {
        pointsToAdd = 2; // Participation points
      }

      const newPoints = (profile.ranking_points || 0) + pointsToAdd;

      // Update ranking points
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ ranking_points: newPoints })
        .eq('user_id', playerId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating ranking:', error);
      throw error;
    }
  },

  /**
   * Distribute tournament points to players based on their placement
   */
  async distributeTournamentPoints(
    tournamentId: string,
    winnerId: string,
    finalistId?: string
  ): Promise<void> {
    try {
      // Get tournament points distribution
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('points_distribution')
        .eq('id', tournamentId)
        .single();

      if (tournamentError) throw tournamentError;

      const pointsDistribution = tournament.points_distribution as any;

      // Award champion points
      await this.addTournamentPoints(winnerId, pointsDistribution.champion || 125);

      // Award finalist points
      if (finalistId) {
        await this.addTournamentPoints(finalistId, pointsDistribution.finalist || 64);
      }

      // Create achievement for champion
      await supabase
        .from('player_achievements')
        .insert({
          user_id: winnerId,
          tournament_id: tournamentId,
          achievement_name: 'Campeão de Torneio',
          achievement_type: 'tournament_win',
          description: 'Venceu um torneio'
        });
    } catch (error) {
      console.error('Error distributing tournament points:', error);
      throw error;
    }
  },

  /**
   * Add tournament points to a player
   */
  async addTournamentPoints(playerId: string, points: number): Promise<void> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('ranking_points')
        .eq('user_id', playerId)
        .single();

      if (profileError) throw profileError;

      const newPoints = (profile.ranking_points || 0) + points;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ ranking_points: newPoints })
        .eq('user_id', playerId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error adding tournament points:', error);
      throw error;
    }
  },

  /**
   * Record match result and update rankings
   */
  async recordMatchResult(
    playerId: string,
    opponentId: string,
    opponentName: string,
    result: 'vitória' | 'derrota',
    score: string,
    matchDate: Date,
    sportType: string,
    courtName?: string,
    notes?: string,
    matchType: 'challenge' | 'tournament' = 'challenge'
  ): Promise<void> {
    try {
      // Add to match history
      await matchHistoryService.addMatch({
        player_id: playerId,
        opponent_id: opponentId,
        opponent_name: opponentName,
        match_date: matchDate.toISOString().split('T')[0],
        result,
        score,
        sport_type: sportType,
        court_name: courtName,
        notes
      });

      // Update ranking points
      await this.updateRankingFromMatch(playerId, result, matchType);

      // Also update opponent's ranking (inverse result)
      const opponentResult = result === 'vitória' ? 'derrota' : 'vitória';
      await this.updateRankingFromMatch(opponentId, opponentResult, matchType);
    } catch (error) {
      console.error('Error recording match result:', error);
      throw error;
    }
  }
};
