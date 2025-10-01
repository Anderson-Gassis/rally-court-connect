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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID é obrigatório");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Buscar sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Pagamento não confirmado");
    }

    const { user_id, ad_type, ad_id, plan_name } = session.metadata;

    // Atualizar registro de pagamento
    await supabaseClient
      .from('ad_payments')
      .update({
        payment_status: 'paid',
        payment_id: session.payment_intent as string,
      })
      .eq('stripe_session_id', sessionId);

    // Atualizar anúncio com o plano pago
    let updateTable = '';
    let updateData: any = {
      ad_plan: plan_name,
      payment_status: 'paid',
    };

    if (ad_type === 'partner_search') {
      updateTable = 'partner_search';
      updateData.payment_id = session.payment_intent as string;
    } else if (ad_type === 'court') {
      updateTable = 'courts';
      updateData.ad_payment_id = session.payment_intent as string;
    } else if (ad_type === 'instructor') {
      updateTable = 'instructor_info';
      updateData.ad_payment_id = session.payment_intent as string;
    }

    await supabaseClient
      .from(updateTable)
      .update(updateData)
      .eq('id', ad_id);

    console.log(`Ad payment confirmed: ${ad_type} ${ad_id} upgraded to ${plan_name}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error confirming ad payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});