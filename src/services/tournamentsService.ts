import { supabase } from '@/lib/supabase';

export interface Tournament {
  id: string;
  name: string;
  image_url: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_fee: number;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  prize: string;
  organizer: string;
  description?: string;
  sport_type: 'tennis' | 'padel' | 'beach-tennis';
  created_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  registration_date: string;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_id?: string;
  created_at: string;
}

export interface CreateTournamentData {
  name: string;
  image_url: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_fee: number;
  max_participants: number;
  prize: string;
  organizer: string;
  description?: string;
  sport_type: 'tennis' | 'padel' | 'beach-tennis';
}

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
      console.error('Error fetching tournaments:', error);
      throw error;
    }

    return data || [];
  },

  async getTournamentById(id: string): Promise<Tournament | null> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching tournament:', error);
      return null;
    }

    return data;
  },

  async registerForTournament(tournamentId: string, userId: string): Promise<TournamentRegistration> {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .insert({
        tournament_id: tournamentId,
        user_id: userId,
        registration_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error registering for tournament:', error);
      throw error;
    }

    return data;
  },

  async getUserTournamentRegistrations(userId: string): Promise<TournamentRegistration[]> {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select(`
        *,
        tournaments (
          name,
          location,
          start_date,
          image_url,
          registration_fee
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tournament registrations:', error);
      throw error;
    }

    return data || [];
  },

  async updateTournamentPaymentStatus(
    registrationId: string,
    paymentStatus: 'paid' | 'failed',
    paymentId?: string
  ): Promise<void> {
    const updateData: any = { payment_status: paymentStatus };
    if (paymentId) {
      updateData.payment_id = paymentId;
    }

    const { error } = await supabase
      .from('tournament_registrations')
      .update(updateData)
      .eq('id', registrationId);

    if (error) {
      console.error('Error updating tournament payment status:', error);
      throw error;
    }
  },

  async createTournament(tournamentData: CreateTournamentData): Promise<Tournament> {
    const { data, error } = await supabase
      .from('tournaments')
      .insert(tournamentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }

    return data;
  },

  async isUserRegistered(tournamentId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single();

    return !error && !!data;
  }
};