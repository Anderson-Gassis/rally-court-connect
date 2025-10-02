import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CourtRow = Database['public']['Tables']['courts']['Row'];

export interface Court extends CourtRow {
  distance?: number;
}

export interface CourtFilters {
  location?: string;
  sport_type?: string;
  max_distance?: number;
  min_price?: number;
  max_price?: number;
  lat?: number;
  lng?: number;
}

type CreateCourtData = Database['public']['Tables']['courts']['Insert'];

export const courtsService = {
  async createCourt(courtData: CreateCourtData): Promise<Court> {
    try {
      const { data, error } = await supabase
        .from('courts')
        .insert(courtData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating court:', error);
        throw new Error(`Erro ao criar quadra: ${error.message}`);
      }

      return data as Court;
    } catch (error: any) {
      console.error('Error in createCourt:', error);
      throw error;
    }
  },

  async getCourts(filters?: CourtFilters): Promise<Court[]> {
    let query = supabase
      .from('courts')
      .select('*')
      .eq('available', true);

    // Apply filters
    if (filters?.sport_type) {
      query = query.eq('sport_type', filters.sport_type);
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.min_price !== undefined) {
      query = query.gte('price_per_hour', filters.min_price);
    }

    if (filters?.max_price !== undefined) {
      query = query.lte('price_per_hour', filters.max_price);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch courts: ${error.message}`);
    }

    let courts = (data || []) as Court[];

    // Calculate distance if user coordinates are provided
    if (filters?.lat && filters?.lng) {
      courts = courts.map(court => {
        if (court.latitude && court.longitude) {
          court.distance = calculateDistance(filters.lat!, filters.lng!, court.latitude, court.longitude);
        }
        return court;
      });

      // Filter by max distance if specified
      if (filters.max_distance) {
        courts = courts.filter(court => 
          !court.distance || court.distance <= filters.max_distance!
        );
      }
    }

    // Sort by plan priority first (premium > basic > free), then by distance
    courts.sort((a, b) => {
      const planPriority = { premium: 3, basic: 2, free: 1 };
      const aPriority = planPriority[a.ad_plan as keyof typeof planPriority] || 0;
      const bPriority = planPriority[b.ad_plan as keyof typeof planPriority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // Same plan, sort by distance
      return (a.distance || 0) - (b.distance || 0);
    });

    return courts;
  },

  async getCourtById(id: string): Promise<Court | null> {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch court: ${error.message}`);
    }

    return data as Court;
  },

  async searchCourts(searchTerm: string, filters?: CourtFilters): Promise<Court[]> {
    let query = supabase
      .from('courts')
      .select('*')
      .eq('available', true);

    // Search in name, location, and description
    if (searchTerm.trim()) {
      query = query.or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Apply additional filters
    if (filters?.sport_type) {
      query = query.eq('sport_type', filters.sport_type);
    }

    if (filters?.min_price !== undefined) {
      query = query.gte('price_per_hour', filters.min_price);
    }

    if (filters?.max_price !== undefined) {
      query = query.lte('price_per_hour', filters.max_price);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search courts: ${error.message}`);
    }

    let courts = (data || []) as Court[];

    // Calculate distance if user coordinates are provided
    if (filters?.lat && filters?.lng) {
      courts = courts.map(court => {
        if (court.latitude && court.longitude) {
          court.distance = calculateDistance(filters.lat!, filters.lng!, court.latitude, court.longitude);
        }
        return court;
      });

      // Filter by max distance if specified
      if (filters.max_distance) {
        courts = courts.filter(court => 
          !court.distance || court.distance <= filters.max_distance!
        );
      }
    }

    // Sort by plan priority first (premium > basic > free), then by distance
    courts.sort((a, b) => {
      const planPriority = { premium: 3, basic: 2, free: 1 };
      const aPriority = planPriority[a.ad_plan as keyof typeof planPriority] || 0;
      const bPriority = planPriority[b.ad_plan as keyof typeof planPriority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // Same plan, sort by distance
      return (a.distance || 0) - (b.distance || 0);
    });

    return courts;
  }
};

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}