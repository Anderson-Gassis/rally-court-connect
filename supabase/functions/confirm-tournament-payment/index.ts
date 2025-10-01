import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Get session ID from request
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log("Confirming tournament payment for session:", sessionId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    console.log("Tournament payment confirmed, creating registration:", session.metadata);

    // Calculate platform fee (15%)
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents
    const platformFee = totalAmount * 0.15;
    const organizerAmount = totalAmount - platformFee;

    // Create tournament registration record with monetization data
    const { data: registration, error: registrationError } = await supabaseClient
      .from('tournament_registrations')
      .insert({
        user_id: session.metadata?.userId,
        tournament_id: session.metadata?.tournamentId,
        payment_status: 'paid',
        platform_fee: platformFee,
        organizer_amount: organizerAmount
      })
      .select()
      .single();

    if (registrationError) {
      console.error("Error creating tournament registration:", registrationError);
      throw new Error(`Failed to create tournament registration: ${registrationError.message}`);
    }

    console.log("Tournament registration created successfully:", registration);

    return new Response(JSON.stringify({ success: true, registration }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error confirming tournament payment:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});