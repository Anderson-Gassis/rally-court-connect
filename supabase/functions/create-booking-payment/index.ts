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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    console.log("Creating booking payment for user:", user.email);

    // Get request body
    const { courtId, bookingDate, startTime, endTime, totalHours, bookingQuantity = 1, amount } = await req.json();

    if (!courtId || !bookingDate || !startTime || !endTime || !totalHours || !amount) {
      throw new Error("Missing required booking information");
    }

    console.log("Booking details:", { 
      courtId, 
      bookingDate, 
      startTime, 
      endTime, 
      totalHours,
      bookingQuantity,
      amount 
    });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if Stripe customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate discount
    const getDiscount = (quantity: number) => {
      if (quantity === 1) return 0;
      if (quantity === 2) return 7;
      return 13; // 3+
    };
    
    const discount = getDiscount(bookingQuantity);
    
    console.log("Price calculation:", { 
      amount,
      bookingQuantity,
      discount
    });

    // Create payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Reserva de Quadra',
              description: `${bookingQuantity} sessão(ões) de ${totalHours}h${discount > 0 ? ` (${discount}% desconto)` : ''}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/courts`,
      metadata: {
        courtId,
        bookingDate,
        startTime,
        endTime,
        userId: user.id,
        totalHours: totalHours.toString(),
        bookingQuantity: bookingQuantity.toString(),
        discountPercentage: discount.toString(),
      },
    });

    console.log("Payment session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating booking payment:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});