import { supabase } from '@/integrations/supabase/client';

export interface Player {
  id: string;
  user_id: string;
  full_name: string;
  // LGPD: Dados sensíveis NÃO expostos na listagem pública
  // email e phone são privados e apenas visíveis para o próprio usuário
  avatar_url?: string;
  skill_level?: string;
  location?: string;
  bio?: string;
  preferred_surface?: string;
  playing_time?: string;
  dominant_hand?: string;
  distance?: number;
}

export interface PlayerFilters {
  sport_type?: string;
  skill_level?: string;
  distance?: number;
  lat?: number;
  lng?: number;
}

export const playersService = {
  async getNearbyPlayers(filters?: PlayerFilters): Promise<Player[]> {
    try {
      // Get current user once at the beginning
      const { data: auth, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.warn('Auth error in getNearbyPlayers:', authError);
        // Continue without filtering current user if auth fails
      }

      console.log('[playersService] Building query for nearby players');
      
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          avatar_url,
          skill_level,
          location,
          bio,
          preferred_surface,
          playing_time,
          dominant_hand
        `)
        .eq('role', 'player');
      
      console.log('[playersService] Current user ID:', auth?.user?.id);

      // Exclude current user if authenticated
      if (auth?.user?.id) {
        query = query.neq('user_id', auth.user.id);
      }

      if (filters?.skill_level) {
        query = query.eq('skill_level', filters.skill_level);
      }

      const { data: players, error } = await query.limit(20);

      console.log('[playersService] Query completed. Players found:', players?.length || 0);

      if (error) {
        console.error('[playersService] Database error in getNearbyPlayers:', error);
        throw error;
      }

      if (!players || players.length === 0) {
        console.log('[playersService] No players found in database');
        return [];
      }

      // Para agora, retornamos os jogadores sem cálculo de distância
      // Mais tarde podemos implementar geolocalização
      const result = players.map(player => ({
        ...player,
        distance: Math.random() * 10 // Mock distance para teste
      }));
      
      console.log('[playersService] Returning', result.length, 'players with mock distances');
      return result;
    } catch (error) {
      console.error('Error fetching nearby players:', error);
      throw error; // Re-throw to let react-query handle the error
    }
  },

  async searchPlayers(searchTerm: string, filters?: PlayerFilters): Promise<Player[]> {
    try {
      // Get current user once at the beginning
      const { data: auth, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.warn('Auth error in searchPlayers:', authError);
        // Continue without filtering current user if auth fails
      }

      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          avatar_url,
          skill_level,
          location,
          bio,
          preferred_surface,
          playing_time,
          dominant_hand
        `)
        .eq('role', 'player');

      // Exclude current user if authenticated
      if (auth?.user?.id) {
        query = query.neq('user_id', auth.user.id);
      }

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      if (filters?.skill_level) {
        query = query.eq('skill_level', filters.skill_level);
      }

      const { data: players, error } = await query.limit(20);

      if (error) {
        console.error('Database error in searchPlayers:', error);
        throw error;
      }

      return players?.map(player => ({
        ...player,
        distance: Math.random() * 10 // Mock distance para teste
      })) || [];
    } catch (error) {
      console.error('Error searching players:', error);
      throw error; // Re-throw to let react-query handle the error
    }
  }
};