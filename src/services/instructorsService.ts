import { supabase } from '@/integrations/supabase/client';

export interface Instructor {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
  specialization?: string[];
  experience_years?: number;
  certifications?: string[];
  hourly_rate: number;
  trial_class_available: boolean;
  trial_class_price: number;
  verified: boolean;
  distance?: number;
}

export interface InstructorFilters {
  distance?: number;
  specialization?: string;
  maxPrice?: number;
  minExperience?: number;
  trialAvailable?: boolean;
}

export interface InstructorAvailability {
  id: string;
  instructor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface BlockedTime {
  id: string;
  instructor_id: string;
  blocked_date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

export const instructorsService = {
  async getNearbyInstructors(filters?: InstructorFilters): Promise<Instructor[]> {
    try {
      console.log('[instructorsService] Buscando instrutores próximos', filters);

      let query = supabase
        .from('instructor_info')
        .select(`
          *,
          profiles!inner (
            user_id,
            full_name,
            avatar_url,
            location
          )
        `)
        .eq('verified', true);

      // Aplicar filtros
      if (filters?.specialization && filters.specialization !== 'all') {
        query = query.contains('specialization', [filters.specialization]);
      }

      if (filters?.maxPrice) {
        query = query.lte('hourly_rate', filters.maxPrice);
      }

      if (filters?.minExperience) {
        query = query.gte('experience_years', filters.minExperience);
      }

      if (filters?.trialAvailable) {
        query = query.eq('trial_class_available', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[instructorsService] Erro ao buscar instrutores:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('[instructorsService] Nenhum instrutor encontrado');
        return [];
      }

      // Mapear dados para o formato esperado
      const instructors: Instructor[] = data.map((instructor: any) => {
        const profile = instructor.profiles;
        
        return {
          id: instructor.id,
          user_id: instructor.user_id,
          full_name: profile?.full_name || 'Professor',
          avatar_url: profile?.avatar_url,
          location: instructor.location || profile?.location,
          bio: instructor.bio,
          specialization: instructor.specialization || [],
          experience_years: instructor.experience_years || 0,
          certifications: instructor.certifications || [],
          hourly_rate: instructor.hourly_rate || 0,
          trial_class_available: instructor.trial_class_available || false,
          trial_class_price: instructor.trial_class_price || 0,
          verified: instructor.verified || false,
          // Mock distance for now - in production, calculate based on coordinates
          distance: Math.random() * (filters?.distance || 50)
        };
      });

      // Ordenar por distância
      instructors.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      console.log('[instructorsService] Instrutores encontrados:', instructors.length);
      return instructors;
    } catch (error) {
      console.error('[instructorsService] Erro ao buscar instrutores:', error);
      return [];
    }
  },

  async getInstructorAvailability(instructorId: string): Promise<InstructorAvailability[]> {
    try {
      const { data, error } = await supabase
        .from('instructor_availability')
        .select('*')
        .eq('instructor_id', instructorId)
        .eq('is_available', true)
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
      return [];
    }
  },

  async getBlockedTimes(instructorId: string, startDate: string, endDate: string): Promise<BlockedTime[]> {
    try {
      const { data, error } = await supabase
        .from('instructor_blocked_times')
        .select('*')
        .eq('instructor_id', instructorId)
        .gte('blocked_date', startDate)
        .lte('blocked_date', endDate)
        .order('blocked_date')
        .order('start_time');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar bloqueios:', error);
      return [];
    }
  },

  async createAvailability(availability: Omit<InstructorAvailability, 'id'>): Promise<InstructorAvailability | null> {
    try {
      const { data, error } = await supabase
        .from('instructor_availability')
        .insert([availability])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar disponibilidade:', error);
      return null;
    }
  },

  async updateAvailability(id: string, updates: Partial<InstructorAvailability>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('instructor_availability')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
      return false;
    }
  },

  async deleteAvailability(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('instructor_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar disponibilidade:', error);
      return false;
    }
  },

  async blockTime(block: Omit<BlockedTime, 'id'>): Promise<BlockedTime | null> {
    try {
      const { data, error } = await supabase
        .from('instructor_blocked_times')
        .insert([block])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao bloquear horário:', error);
      return null;
    }
  },

  async deleteBlockedTime(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('instructor_blocked_times')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar bloqueio:', error);
      return false;
    }
  }
};