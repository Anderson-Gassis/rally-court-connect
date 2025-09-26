import { supabase } from '@/lib/supabase';

export interface Court {
  id: string;
  name: string;
  type: string;
  sport_type: 'tennis' | 'padel' | 'beach-tennis';
  image_url: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  price_per_hour: number;
  available: boolean;
  features: string[];
  description?: string;
  distance?: string;
}

export interface CourtFilters {
  location?: string;
  sport_type?: string;
  max_distance?: number;
  min_price?: number;
  max_price?: number;
  features?: string[];
  latitude?: number;
  longitude?: number;
}

export const courtsService = {
  async createCourt(courtData: {
    name: string;
    type: string;
    sport_type: string;
    location: string;
    address?: string;
    latitude?: number | null;
    longitude?: number | null;
    price_per_hour: number;
    image_url?: string;
    description?: string;
    features?: string[];
    owner_id: string;
  }): Promise<Court> {
    const { data, error } = await supabase
      .from('courts')
      .insert({
        ...courtData,
        available: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating court:', error);
      throw error;
    }

    return data;
  },

  async getCourts(filters?: CourtFilters): Promise<Court[]> {
    let query = supabase
      .from('courts')
      .select('*')
      .eq('available', true);

    if (filters?.sport_type) {
      query = query.eq('sport_type', filters.sport_type);
    }

    if (filters?.min_price) {
      query = query.gte('price_per_hour', filters.min_price);
    }

    if (filters?.max_price) {
      query = query.lte('price_per_hour', filters.max_price);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching courts:', error);
      throw error;
    }

    // Calculate distances if user location is provided
    const courtsWithDistance = data?.map(court => {
      let distance = undefined;
      
      if (filters?.latitude && filters?.longitude) {
        const dist = calculateDistance(
          filters.latitude,
          filters.longitude,
          court.latitude,
          court.longitude
        );
        distance = `${dist.toFixed(1)}km`;
      }

      return {
        ...court,
        distance,
      };
    }) || [];

    // Filter by distance if specified
    if (filters?.max_distance && filters?.latitude && filters?.longitude) {
      return courtsWithDistance.filter(court => {
        const dist = calculateDistance(
          filters.latitude!,
          filters.longitude!,
          court.latitude,
          court.longitude
        );
        return dist <= filters.max_distance!;
      });
    }

    return courtsWithDistance;
  },

  async getCourtById(id: string): Promise<Court | null> {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching court:', error);
      return null;
    }

    return data;
  },

  async searchCourts(searchTerm: string, filters?: CourtFilters): Promise<Court[]> {
    let query = supabase
      .from('courts')
      .select('*')
      .eq('available', true);

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%, location.ilike.%${searchTerm}%`);
    }

    if (filters?.sport_type) {
      query = query.eq('sport_type', filters.sport_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error searching courts:', error);
      throw error;
    }

    return data || [];
  }
};

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}