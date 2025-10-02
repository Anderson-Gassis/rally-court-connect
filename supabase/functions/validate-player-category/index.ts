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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) throw new Error('Unauthorized');

    const { tournamentId, requestedCategory } = await req.json();

    // Get player's profile and ranking
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('ranking_points, skill_level')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    // Category thresholds based on ranking points
    const categoryThresholds = {
      'C': { min: 0, max: 50 },
      'B': { min: 51, max: 150 },
      'A': { min: 151, max: 300 },
      'Amador': { min: 301, max: 600 },
      'Profissional': { min: 601, max: Infinity }
    };

    const rankingPoints = profile.ranking_points || 0;
    
    // Determine suggested category based on ranking
    let suggestedCategory = 'C';
    for (const [category, threshold] of Object.entries(categoryThresholds)) {
      if (rankingPoints >= threshold.min && rankingPoints <= threshold.max) {
        suggestedCategory = category;
        break;
      }
    }

    // Check if player is trying to register in a category too far below their level
    const categoryOrder = ['C', 'B', 'A', 'Amador', 'Profissional'];
    const requestedIndex = categoryOrder.indexOf(requestedCategory);
    const suggestedIndex = categoryOrder.indexOf(suggestedCategory);
    
    const differenceAllowed = 1; // Allow 1 category difference
    const isFairPlay = (suggestedIndex - requestedIndex) <= differenceAllowed;

    const validation = {
      isValid: isFairPlay,
      suggestedCategory,
      requestedCategory,
      rankingPoints,
      message: isFairPlay 
        ? 'Categoria validada com sucesso'
        : `Alerta: Jogador com ${rankingPoints} pontos tentando se inscrever na categoria ${requestedCategory}. Categoria sugerida: ${suggestedCategory}`,
      warningLevel: isFairPlay ? 'none' : 'high'
    };

    // Log the validation attempt
    console.log('Category validation:', validation);

    return new Response(
      JSON.stringify(validation),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in validate-player-category:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});