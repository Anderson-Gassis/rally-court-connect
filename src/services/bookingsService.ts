import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];

export interface Booking extends BookingRow {
  courts?: {
    name: string;
    location: string;
    image_url: string;
  };
}

type CreateBookingData = Database['public']['Tables']['bookings']['Insert'];

export const bookingsService = {
  async createBooking(bookingData: CreateBookingData, userId: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...bookingData,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }

    return data;
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        courts (
          name,
          location,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });

    if (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }

    return data || [];
  },

  async getCourtAvailability(courtId: string, date: string): Promise<{ start_time: string; end_time: string }[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('court_id', courtId)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Error fetching availability:', error);
      throw error;
    }

    return data || [];
  },

  async cancelBooking(bookingId: string, userId: string): Promise<{ canCancel: boolean; reason?: string }> {
    // First, fetch the booking to check the date and time
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('booking_date, start_time, status')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !booking) {
      console.error('Error fetching booking:', fetchError);
      throw new Error('Reserva não encontrada');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Esta reserva já foi cancelada');
    }

    // Check if booking is at least 24 hours away
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
      return {
        canCancel: false,
        reason: 'Cancelamentos devem ser feitos com pelo menos 24 horas de antecedência.'
      };
    }

    // Proceed with cancellation
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }

    return { canCancel: true };
  },

  async updatePaymentStatus(bookingId: string, paymentStatus: 'paid' | 'failed', paymentId?: string): Promise<void> {
    const updateData: any = { payment_status: paymentStatus };
    if (paymentId) {
      updateData.payment_id = paymentId;
    }
    if (paymentStatus === 'paid') {
      updateData.status = 'confirmed';
    }

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }
};