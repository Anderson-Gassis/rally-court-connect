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
  }
};