import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type FriendRequestRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { request_id } = await req.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: 'Missing request_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch request and validate permissions
    const { data: request, error: fetchErr } = await supabaseClient
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status')
      .eq('id', request_id)
      .single<FriendRequestRow>();

    if (fetchErr || !request) {
      return new Response(JSON.stringify({ error: 'Solicitação não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.receiver_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Sem permissão para aceitar esta solicitação' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (request.status !== 'pending') {
      return new Response(JSON.stringify({ error: 'Esta solicitação já foi respondida' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update request to accepted
    const { data: updatedRequest, error: updateErr } = await supabaseAdmin
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', request_id)
      .select()
      .single<FriendRequestRow>();

    if (updateErr) {
      console.error('Error updating friend request:', updateErr);
      return new Response(JSON.stringify({ error: 'Falha ao aceitar solicitação' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create friendships in both directions (idempotent)
    const pairs = [
      { user_id: request.sender_id, friend_id: request.receiver_id },
      { user_id: request.receiver_id, friend_id: request.sender_id },
    ];

    for (const pair of pairs) {
      const { error: insErr } = await supabaseAdmin
        .from('friendships')
        .insert(pair);
      if (insErr && insErr.code !== '23505') {
        // Ignore duplicate constraint errors, fail on others
        console.warn('Friendship insert warning:', insErr.message);
      }
    }

    // Notify sender about acceptance
    const { error: notifErr } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: request.sender_id,
        type: 'friend_request_accepted',
        title: 'Pedido de amizade aceito',
        message: 'Seu pedido de amizade foi aceito!',
        data: { request_id: request.id, receiver_id: request.receiver_id },
        read: false,
      });
    if (notifErr) {
      console.warn('Notification insert warning:', notifErr.message);
    }

    return new Response(
      JSON.stringify({ request: updatedRequest }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Unexpected error (accept-friend-request):', err);
    return new Response(JSON.stringify({ error: err?.message || 'Erro inesperado' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});