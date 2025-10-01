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

    console.log('Starting challenge reminders check...');

    // Calculate 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];

    console.log(`Checking challenges for ${tomorrowDate}`);

    // Get challenges that are accepted and scheduled for tomorrow
    const { data: challenges, error: challengesError } = await supabase
      .from('challenges')
      .select(`
        id,
        challenger_id,
        challenged_id,
        challenge_type,
        preferred_date,
        message
      `)
      .eq('preferred_date', tomorrowDate)
      .eq('status', 'accepted');

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      throw challengesError;
    }

    console.log(`Found ${challenges?.length || 0} challenges to remind`);

    if (!challenges || challenges.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No challenges to remind', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let remindersSent = 0;

    // Send notifications for each challenge (to both players)
    for (const challenge of challenges) {
      try {
        // Get player names
        const { data: challengerProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', challenge.challenger_id)
          .single();

        const { data: challengedProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', challenge.challenged_id)
          .single();

        const challengerName = challengerProfile?.full_name || 'Jogador';
        const challengedName = challengedProfile?.full_name || 'Jogador';

        const challengeTypeMap: Record<string, string> = {
          'friendly': 'Amistoso',
          'singles': 'Individual (Singles)',
          'doubles': 'Duplas (Doubles)',
          'ranking': 'Partida Rankeada'
        };

        const typeLabel = challengeTypeMap[challenge.challenge_type] || challenge.challenge_type;
        const formattedDate = new Date(challenge.preferred_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        // Check and send reminder to challenger
        const { data: existingChallengerNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', challenge.challenger_id)
          .eq('type', 'challenge_reminder')
          .contains('data', { challenge_id: challenge.id })
          .single();

        if (!existingChallengerNotif) {
          await supabase
            .from('notifications')
            .insert({
              user_id: challenge.challenger_id,
              type: 'challenge_reminder',
              title: '🎾 Lembrete: Partida Amanhã',
              message: `Sua partida ${typeLabel} com ${challengedName} está marcada para amanhã, ${formattedDate}. Boa sorte!`,
              data: {
                challenge_id: challenge.id,
                challenge_type: challenge.challenge_type,
                preferred_date: challenge.preferred_date,
                opponent_name: challengedName
              }
            });
          remindersSent++;
          console.log(`Reminder sent to challenger for challenge ${challenge.id}`);
        }

        // Check and send reminder to challenged player
        const { data: existingChallengedNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', challenge.challenged_id)
          .eq('type', 'challenge_reminder')
          .contains('data', { challenge_id: challenge.id })
          .single();

        if (!existingChallengedNotif) {
          await supabase
            .from('notifications')
            .insert({
              user_id: challenge.challenged_id,
              type: 'challenge_reminder',
              title: '🎾 Lembrete: Partida Amanhã',
              message: `Sua partida ${typeLabel} com ${challengerName} está marcada para amanhã, ${formattedDate}. Boa sorte!`,
              data: {
                challenge_id: challenge.id,
                challenge_type: challenge.challenge_type,
                preferred_date: challenge.preferred_date,
                opponent_name: challengerName
              }
            });
          remindersSent++;
          console.log(`Reminder sent to challenged player for challenge ${challenge.id}`);
        }

      } catch (error) {
        console.error(`Error processing challenge ${challenge.id}:`, error);
      }
    }

    console.log(`Challenge reminders process completed. Sent ${remindersSent} reminders.`);

    return new Response(
      JSON.stringify({ 
        message: 'Challenge reminders sent successfully',
        challenges_checked: challenges.length,
        reminders_sent: remindersSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in send-challenge-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});