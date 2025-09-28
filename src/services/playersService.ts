import { supabase } from '@/integrations/supabase/client';

export interface Player {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  skill_level?: string;
  location?: string;
  bio?: string;
  preferred_surface?: string;
  playing_time?: string;
  dominant_hand?: string;
  phone?: string;
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
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          email,
          avatar_url,
          skill_level,
          location,
          bio,
          preferred_surface,
          playing_time,
          dominant_hand,
          phone
        `)
        .eq('role', 'player')
        .neq('user_id', (await supabase.auth.getUser()).data.user?.id || '');

      if (filters?.skill_level) {
        query = query.eq('skill_level', filters.skill_level);
      }

      const { data: players, error } = await query.limit(20);

      if (error) throw error;

      // Para agora, retornamos os jogadores sem cálculo de distância
      // Mais tarde podemos implementar geolocalização
      return players?.map(player => ({
        ...player,
        distance: Math.random() * 10 // Mock distance para teste
      })) || [];
    } catch (error) {
      console.error('Error fetching nearby players:', error);
      return [];
    }
  },

  async searchPlayers(searchTerm: string, filters?: PlayerFilters): Promise<Player[]> {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          full_name,
          email,
          avatar_url,
          skill_level,
          location,
          bio,
          preferred_surface,
          playing_time,
          dominant_hand,
          phone
        `)
        .eq('role', 'player')
        .neq('user_id', (await supabase.auth.getUser()).data.user?.id || '');

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      if (filters?.skill_level) {
        query = query.eq('skill_level', filters.skill_level);
      }

      const { data: players, error } = await query.limit(20);

      if (error) throw error;

      return players?.map(player => ({
        ...player,
        distance: Math.random() * 10 // Mock distance para teste
      })) || [];
    } catch (error) {
      console.error('Error searching players:', error);
      return [];
    }
  }
};