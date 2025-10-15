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
    // Create clients: one for auth (anon) and one with service role for DB writes
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseAuth.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const {
      bookingId,
      instructorId,
      bookingDate,
      startTime,
      endTime,
      totalHours,
      isTrial,
      amount,
    } = await req.json();

    console.log("[create-instructor-class-payment] Processing payment:", {
      bookingId,
      instructorId,
      amount,
      isTrial,
    });

    // Verificar se já existe um booking para este horário (prevenir duplicação)
    const { data: existingBooking, error: checkError } = await supabaseService
      .from('class_bookings')
      .select('id')
      .eq('instructor_id', instructorId)
      .eq('booking_date', bookingDate)
      .eq('start_time', startTime)
      .eq('end_time', endTime)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle();

    if (checkError) {
      console.error("[create-instructor-class-payment] Error checking existing booking:", checkError);
    }

    if (existingBooking) {
      console.log("[create-instructor-class-payment] Booking already exists:", existingBooking.id);
      throw new Error("Já existe um agendamento para este horário. Por favor, escolha outro horário.");
    }

    // Buscar informações do instrutor
    const { data: instructorData, error: instructorError } = await supabaseService
      .from("instructor_info")
      .select("user_id")
      .eq("id", instructorId)
      .single();

    if (instructorError || !instructorData) {
      console.error("[create-instructor-class-payment] Instructor query error:", instructorError);
      throw new Error("Instructor not found");
    }

    // Buscar perfil do instrutor
    const { data: profileData } = await supabaseService
      .from("profiles")
      .select("full_name")
      .eq("user_id", instructorData.user_id)
      .single();

    const instructorName = profileData?.full_name || "Professor";

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Verificar/criar cliente Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Ensure booking exists (create using service role if missing)
    let bookingIdToUse = bookingId as string | undefined;
    if (!bookingIdToUse) {
      const classTitle = isTrial ? 'Aula Experimental' : 'Aula Individual';
      const { data: classData, error: classError } = await supabaseService
        .from('classes')
        .insert({
          instructor_id: instructorId,
          title: classTitle,
          class_type: isTrial ? 'trial' : 'individual',
          description: `Aula agendada para ${bookingDate} das ${startTime} às ${endTime}`,
          duration_minutes: Math.round((totalHours || 1) * 60),
          price: amount / 100,
          max_students: 1
        })
        .select()
        .single();
      if (classError) throw new Error(`Failed to create class: ${classError.message}`);

      const total = amount / 100;
      const platformFee = total * 0.15;
      const instructorAmount = total - platformFee;

      const { data: bookingRow, error: bookingError } = await supabaseService
        .from('class_bookings')
        .insert({
          class_id: classData.id,
          student_id: user.id,
          instructor_id: instructorId,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          total_price: total,
          is_trial: isTrial,
          platform_fee: platformFee,
          instructor_amount: instructorAmount,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();
      if (bookingError) throw new Error(`Failed to create booking: ${bookingError.message}`);
      bookingIdToUse = bookingRow.id;
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Aula com ${instructorName}${isTrial ? " (Experimental)" : ""}`,
              description: `${bookingDate} das ${startTime} às ${endTime} (${totalHours}h)`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/player-dashboard?payment=success`,
      cancel_url: `${req.headers.get("origin")}/instructors`,
      metadata: {
        booking_id: bookingIdToUse,
        instructor_id: instructorId,
        booking_type: "class",
      },
    });

    // Atualizar booking com session_id
    await supabaseService
      .from("class_bookings")
      .update({ payment_id: session.id })
      .eq("id", bookingIdToUse as string);

    console.log("[create-instructor-class-payment] Session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("[create-instructor-class-payment] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
