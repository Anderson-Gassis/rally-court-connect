import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting booking reminders check...');

    // Calculate 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(now.getHours() + 24);
    tomorrow.setMinutes(0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setHours(dayAfter.getHours() + 1);

    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    const tomorrowTime = tomorrow.toTimeString().split(' ')[0].substring(0, 5);
    const dayAfterTime = dayAfter.toTimeString().split(' ')[0].substring(0, 5);

    console.log(`Checking bookings for ${tomorrowDate} between ${tomorrowTime} and ${dayAfterTime}`);

    // Get bookings that are 24 hours away
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        user_id,
        booking_date,
        start_time,
        court_id,
        courts (
          name,
          location
        )
      `)
      .eq('booking_date', tomorrowDate)
      .gte('start_time', tomorrowTime)
      .lt('start_time', dayAfterTime)
      .eq('status', 'confirmed')
      .eq('payment_status', 'paid');

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    console.log(`Found ${bookings?.length || 0} bookings to remind`);

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No bookings to remind', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let remindersSent = 0;

    // Send notification for each booking
    for (const booking of bookings) {
      try {
        // Check if reminder was already sent
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', booking.user_id)
          .eq('type', 'booking_reminder')
          .contains('data', { booking_id: booking.id })
          .single();

        if (existingNotification) {
          console.log(`Reminder already sent for booking ${booking.id}`);
          continue;
        }

        const courtName = booking.courts?.name || 'Quadra';
        const courtLocation = booking.courts?.location || '';
        const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
        const formattedDate = bookingDateTime.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const formattedTime = booking.start_time.substring(0, 5);

        // Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: booking.user_id,
            type: 'booking_reminder',
            title: '🔔 Lembrete: Agendamento Amanhã',
            message: `Sua reserva em ${courtName} ${courtLocation ? `(${courtLocation})` : ''} está marcada para amanhã, ${formattedDate} às ${formattedTime}h. Não esqueça!`,
            data: {
              booking_id: booking.id,
              court_id: booking.court_id,
              court_name: courtName,
              booking_date: booking.booking_date,
              start_time: booking.start_time
            }
          });

        if (notificationError) {
          console.error(`Error creating notification for booking ${booking.id}:`, notificationError);
        } else {
          remindersSent++;
          console.log(`Reminder sent for booking ${booking.id}`);
        }
      } catch (error) {
        console.error(`Error processing booking ${booking.id}:`, error);
      }
    }

    console.log(`Reminders process completed. Sent ${remindersSent} reminders.`);

    return new Response(
      JSON.stringify({ 
        message: 'Reminders sent successfully',
        bookings_checked: bookings.length,
        reminders_sent: remindersSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in send-booking-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});