import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("Unauthorized");

    const { tournamentId, reason } = await req.json();

    // Verificar se o usuário é o organizador
    const { data: tournament, error: tournamentError } = await supabaseClient
      .from("tournaments")
      .select("*")
      .eq("id", tournamentId)
      .single();

    if (tournamentError) throw new Error("Tournament not found");
    if (tournament.organizer_id !== user.id) throw new Error("Only organizer can cancel tournament");

    // Buscar todas as inscrições pagas
    const { data: registrations, error: regsError } = await supabaseClient
      .from("tournament_registrations")
      .select("*")
      .eq("tournament_id", tournamentId)
      .eq("payment_status", "paid");

    if (regsError) {
      console.error("Error fetching registrations:", regsError);
      throw new Error(`Failed to fetch registrations: ${regsError.message}`);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const refundResults = [];
    
    // Processar estornos
    if (registrations && registrations.length > 0) {
      for (const reg of registrations) {
        try {
          if (reg.stripe_payment_intent_id) {
            // Criar estorno
            const refund = await stripe.refunds.create({
              payment_intent: reg.stripe_payment_intent_id,
              reason: "requested_by_customer",
            });

            // Atualizar status da inscrição
            await supabaseClient
              .from("tournament_registrations")
              .update({ 
                payment_status: "refunded",
                refund_id: refund.id 
              })
              .eq("id", reg.id);

            refundResults.push({ success: true, registrationId: reg.id });

            // Criar notificação para o jogador
            await supabaseClient
              .from("notifications")
              .insert({
                user_id: reg.user_id,
                type: "tournament_cancelled",
                title: "Torneio Cancelado",
                message: `O torneio "${tournament.name}" foi cancelado. Seu pagamento será estornado.`,
                data: {
                  tournament_id: tournamentId,
                  refund_id: refund.id,
                  reason: reason
                }
              });
          }
        } catch (error) {
          console.error(`Failed to refund registration ${reg.id}:`, error);
          refundResults.push({ success: false, registrationId: reg.id, error: error.message });
        }
      }
    }

    // Marcar torneio como cancelado
    const { error: cancelError } = await supabaseClient
      .from("tournaments")
      .update({
        cancelled: true,
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
        status: "cancelled"
      })
      .eq("id", tournamentId);

    if (cancelError) throw cancelError;

    return new Response(
      JSON.stringify({
        success: true,
        refunds: refundResults,
        totalRefunded: refundResults.filter(r => r.success).length
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error cancelling tournament:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});