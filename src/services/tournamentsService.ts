import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TournamentRow = Database['public']['Tables']['tournaments']['Row'];
type TournamentRegistrationRow = Database['public']['Tables']['tournament_registrations']['Row'];

export interface Tournament extends TournamentRow {}

export interface TournamentRegistration extends TournamentRegistrationRow {
  tournaments?: Partial<Tournament>;
}

type CreateTournamentData = Database['public']['Tables']['tournaments']['Insert'];

export const tournamentsService = {
  async getTournaments(filters?: { sport_type?: string; status?: string }): Promise<Tournament[]> {
    let query = supabase
      .from('tournaments')
      .select('*')
      .order('start_date', { ascending: true });

    if (filters?.sport_type) {
      query = query.eq('sport_type', filters.sport_type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tournaments: ${error.message}`);
    }

    return (data || []) as Tournament[];
  },

  async getTournamentById(id: string): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch tournament: ${error.message}`);
    }

    return data as Tournament;
  },

  async registerForTournament(tournamentId: string, userId: string): Promise<TournamentRegistration> {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournamentId,
        user_id: userId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to register for tournament: ${error.message}`);
    }

    return data as TournamentRegistration;
  },

  async getUserTournamentRegistrations(userId: string): Promise<TournamentRegistration[]> {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select(`
        *,
        tournaments:tournament_id (
          name,
          location,
          start_date,
          end_date,
          entry_fee,
          sport_type
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch user tournament registrations: ${error.message}`);
    }

    return (data || []) as TournamentRegistration[];
  },

  async updateTournamentPaymentStatus(
    registrationId: string,
    paymentStatus: 'paid' | 'failed',
    paymentId?: string
  ): Promise<void> {
    const updateData: any = { payment_status: paymentStatus };
    
    const { error } = await supabase
      .from('tournament_registrations')
      .update(updateData)
      .eq('id', registrationId);

    if (error) {
      throw new Error(`Failed to update tournament payment status: ${error.message}`);
    }
  },

  async createTournament(tournamentData: CreateTournamentData): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .insert(tournamentData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create tournament: ${error.message}`);
    }

    return data as Tournament;
  },

  async isUserRegistered(tournamentId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check tournament registration: ${error.message}`);
    }

    return !!data;
  },

  /**
   * Generates the full tournament bracket.
   * - Fetches paid registrations and shuffles randomly.
   * - Creates Round 1 matches; odd-player-out receives a BYE (auto-win).
   * - Pre-creates empty placeholder rows for all subsequent rounds.
   */
  async generateBracket(tournamentId: string): Promise<void> {
    // 1. Get registered players
    const { data: registrations, error: registrationError } = await supabase
      .from('tournament_registrations')
      .select('user_id')
      .eq('tournament_id', tournamentId)
      .eq('payment_status', 'paid');

    if (registrationError) throw new Error(`Failed to fetch registrations: ${registrationError.message}`);
    if (!registrations || registrations.length < 2) {
      throw new Error('É necessário pelo menos 2 inscritos pagantes para gerar as chaves');
    }

    // 2. Shuffle players
    const players = [...registrations].sort(() => Math.random() - 0.5);

    // 3. Calculate bracket size (next power of 2)
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(players.length)));
    const totalRounds = Math.log2(bracketSize);

    // Pad with BYE slots
    while (players.length < bracketSize) {
      players.push({ user_id: null as unknown as string });
    }

    const bracketRows: any[] = [];

    // 4. Build Round 1 matches
    const round1MatchCount = bracketSize / 2;
    for (let i = 0; i < round1MatchCount; i++) {
      const p1 = players[i * 2];
      const p2 = players[i * 2 + 1];
      const matchNumber = i + 1;

      // BYE: if one player is null, other auto-advances
      const isBye = !p1?.user_id || !p2?.user_id;
      bracketRows.push({
        tournament_id: tournamentId,
        round: 'round_1',
        match_number: matchNumber,
        player1_id: p1?.user_id || null,
        player2_id: p2?.user_id || null,
        status: isBye ? 'completed' : 'pending',
        // BYE winner is the non-null player
        winner_id: isBye ? (p1?.user_id || p2?.user_id || null) : null,
      });
    }

    // 5. Build empty placeholder rows for rounds 2..N
    for (let round = 2; round <= totalRounds; round++) {
      const matchCount = bracketSize / Math.pow(2, round);
      for (let m = 1; m <= matchCount; m++) {
        bracketRows.push({
          tournament_id: tournamentId,
          round: `round_${round}`,
          match_number: m,
          player1_id: null,
          player2_id: null,
          status: 'pending',
          winner_id: null,
        });
      }
    }

    // 6. Clear any existing bracket and insert new one
    await supabase
      .from('tournament_brackets')
      .delete()
      .eq('tournament_id', tournamentId);

    const { error: insertError } = await supabase
      .from('tournament_brackets')
      .insert(bracketRows);

    if (insertError) throw new Error(`Failed to generate bracket: ${insertError.message}`);

    // 7. Advance BYE winners to round 2
    for (const match of bracketRows.filter(m => m.round === 'round_1' && m.winner_id)) {
      if (!match.winner_id) continue;
      const nextMatchNumber = Math.ceil(match.match_number / 2);
      const isP1Position = match.match_number % 2 === 1;
      await supabase
        .from('tournament_brackets')
        .update({ [isP1Position ? 'player1_id' : 'player2_id']: match.winner_id })
        .eq('tournament_id', tournamentId)
        .eq('round', 'round_2')
        .eq('match_number', nextMatchNumber);
    }

    // 8. Update tournament status to 'in_progress'
    await supabase
      .from('tournaments')
      .update({ status: 'in_progress' })
      .eq('id', tournamentId);
  },

  async finalizeTournament(
    tournamentId: string,
    winnerId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('tournaments')
      .update({ status: 'completed', winner_id: winnerId })
      .eq('id', tournamentId);

    if (error) throw new Error(`Failed to finalize tournament: ${error.message}`);
  },
};