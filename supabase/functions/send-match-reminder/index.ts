import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get matches scheduled within the next hour
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    const { data: matches, error: matchesError } = await supabaseAdmin
      .from('tournament_brackets')
      .select(`
        *,
        player1:player1_id (*),
        player2:player2_id (*),
        tournament:tournament_id (name)
      `)
      .eq('status', 'pending')
      .gte('scheduled_time', new Date().toISOString())
      .lte('scheduled_time', oneHourFromNow.toISOString());

    if (matchesError) throw matchesError;

    console.log(`Found ${matches?.length || 0} matches to send reminders for`);

    // Send notifications for each match
    for (const match of matches || []) {
      const notifications = [];

      if (match.player1_id) {
        notifications.push({
          user_id: match.player1_id,
          type: 'tournament',
          title: 'Lembrete de Partida',
          message: `Sua partida no torneio ${match.tournament?.name} começa em 1 hora!`,
          data: {
            match_id: match.id,
            tournament_id: match.tournament_id,
            scheduled_time: match.scheduled_time
          }
        });
      }

      if (match.player2_id) {
        notifications.push({
          user_id: match.player2_id,
          type: 'tournament',
          title: 'Lembrete de Partida',
          message: `Sua partida no torneio ${match.tournament?.name} começa em 1 hora!`,
          data: {
            match_id: match.id,
            tournament_id: match.tournament_id,
            scheduled_time: match.scheduled_time
          }
        });
      }

      if (notifications.length > 0) {
        const { error: notifError } = await supabaseAdmin
          .from('notifications')
          .insert(notifications);

        if (notifError) {
          console.error('Error creating notifications:', notifError);
        } else {
          console.log(`Sent reminders for match ${match.id}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        matches_processed: matches?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in send-match-reminder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});