import { supabase } from '@/integrations/supabase/client';

export interface AvailableTimeSlot {
  time: string;
  isAvailable: boolean;
  reason?: string;
}

export const courtAvailabilityService = {
  /**
   * Busca horários disponíveis para uma quadra em uma data específica
   */
  async getAvailableTimeSlotsForDate(
    courtId: string,
    date: Date
  ): Promise<AvailableTimeSlot[]> {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    // Buscar disponibilidade semanal
    const { data: weeklyAvailability, error: weeklyError } = await supabase
      .from('court_availability')
      .select('*')
      .eq('court_id', courtId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (weeklyError) {
      console.error('Error fetching weekly availability:', weeklyError);
      return [];
    }

    // Buscar bloqueios específicos para esta data
    const { data: blockedTimes, error: blockedError } = await supabase
      .from('court_blocked_times')
      .select('*')
      .eq('court_id', courtId)
      .eq('blocked_date', dateStr);

    if (blockedError) {
      console.error('Error fetching blocked times:', blockedError);
    }

    // Buscar reservas existentes para esta data
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('court_id', courtId)
      .eq('booking_date', dateStr)
      .in('status', ['confirmed', 'pending']);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
    }

    // Gerar todos os slots de 30 minutos
    const allSlots: AvailableTimeSlot[] = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        allSlots.push({ time, isAvailable: false });
      }
    }

    // Marcar slots como disponíveis baseado na disponibilidade semanal
    if (weeklyAvailability && weeklyAvailability.length > 0) {
      for (const slot of allSlots) {
        const slotMinutes = timeToMinutes(slot.time);
        
        for (const availability of weeklyAvailability) {
          const startMinutes = timeToMinutes(availability.start_time);
          const endMinutes = timeToMinutes(availability.end_time);
          
          if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
            slot.isAvailable = true;
            break;
          }
        }
      }
    }

    // Remover slots bloqueados
    if (blockedTimes && blockedTimes.length > 0) {
      for (const slot of allSlots) {
        const slotMinutes = timeToMinutes(slot.time);
        
        for (const blocked of blockedTimes) {
          const startMinutes = timeToMinutes(blocked.start_time);
          const endMinutes = timeToMinutes(blocked.end_time);
          
          if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
            slot.isAvailable = false;
            slot.reason = blocked.reason || 'Horário bloqueado';
            break;
          }
        }
      }
    }

    // Remover slots já reservados
    if (bookings && bookings.length > 0) {
      for (const slot of allSlots) {
        const slotMinutes = timeToMinutes(slot.time);
        
        for (const booking of bookings) {
          const startMinutes = timeToMinutes(booking.start_time);
          const endMinutes = timeToMinutes(booking.end_time);
          
          if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
            slot.isAvailable = false;
            slot.reason = 'Já reservado';
            break;
          }
        }
      }
    }

    return allSlots;
  },

  /**
   * Verifica se um horário específico está disponível
   */
  async isTimeRangeAvailable(
    courtId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<{ available: boolean; reason?: string }> {
    const slots = await this.getAvailableTimeSlotsForDate(courtId, date);
    
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Verificar se todos os slots no intervalo estão disponíveis
    for (const slot of slots) {
      const slotMinutes = timeToMinutes(slot.time);
      
      if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
        if (!slot.isAvailable) {
          return { available: false, reason: slot.reason || 'Horário indisponível' };
        }
      }
    }

    return { available: true };
  },
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
