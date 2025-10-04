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
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    // Update payment status
    const { data: payment, error: updateError } = await supabaseClient
      .from("instructor_ad_payments")
      .update({
        payment_status: "paid",
        payment_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", sessionId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update instructor_info with the new plan
    const { error: instructorError } = await supabaseClient
      .from("instructor_info")
      .update({
        ad_plan: payment.plan_name,
        payment_status: "paid",
        ad_payment_id: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.instructor_id);

    if (instructorError) throw instructorError;

    return new Response(JSON.stringify({ success: true, payment }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error confirming instructor ad payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
