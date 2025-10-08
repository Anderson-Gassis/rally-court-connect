import { supabase } from "@/integrations/supabase/client";

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: {
    full_name: string;
    avatar_url?: string;
    email: string;
  };
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
    skill_level?: string;
  };
}

export const searchUsers = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, avatar_url, skill_level')
    .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .limit(20);

  if (error) throw error;
  return data;
};

export const sendFriendRequest = async (receiverId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Impedir auto-convite
  if (user.id === receiverId) {
    throw new Error('Você não pode enviar convite para si mesmo');
  }

  // Verificar se já são amigos
  const { data: existingFriendship } = await supabase
    .from('friendships')
    .select('id')
    .eq('user_id', user.id)
    .eq('friend_id', receiverId)
    .single();

  if (existingFriendship) {
    throw new Error('Vocês já são amigos');
  }

  // Verificar se existe uma solicitação pendente inversa (receiverId -> user.id)
  const { data: inverseRequest } = await supabase
    .from('friend_requests')
    .select('id')
    .eq('sender_id', receiverId)
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();

  // Se existe solicitação inversa pendente, não aceitar automaticamente
  if (inverseRequest) {
    return { id: inverseRequest.id, message: 'Já existe uma solicitação recebida. Acesse a aba Solicitações para aceitar.' };
  }

  // Inserir nova solicitação
  const { data, error } = await supabase
    .from('friend_requests')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Solicitação pendente existente - tentar limpar e reenviar
      try {
        await supabase.functions.invoke('cleanup-friend-requests', {
          body: { target_user_id: receiverId }
        });
        // Tentar reenviar uma única vez
        const retry = await supabase
          .from('friend_requests')
          .insert({
            sender_id: user.id,
            receiver_id: receiverId,
            status: 'pending'
          })
          .select()
          .single();

        if (retry.error) {
          throw new Error('Já existe uma solicitação pendente entre vocês');
        }

        // Dispara notificação para o destinatário após recriar a solicitação
        try {
          await supabase.functions.invoke('create-notification', {
            body: {
              user_id: receiverId,
              type: 'friend_request',
              title: 'Novo pedido de amizade',
              message: 'Você recebeu um pedido de amizade',
              data: { request_id: retry.data.id, sender_id: user.id, receiver_id: receiverId }
            }
          });
        } catch (e) {
          console.warn('Falha ao criar notificação de amizade (ignorado):', e);
        }

        return retry.data;
      } catch (e) {
        throw new Error('Já existe uma solicitação pendente entre vocês');
      }
    }
    if (error.code === '23514') { // Check constraint (auto-convite)
      throw new Error('Você não pode enviar convite para si mesmo');
    }
    throw error;
  }

  // Dispara notificação para o destinatário (receiver)
  try {
    await supabase.functions.invoke('create-notification', {
      body: {
        user_id: receiverId,
        type: 'friend_request',
        title: 'Novo pedido de amizade',
        message: 'Você recebeu um pedido de amizade',
        data: { request_id: data.id, sender_id: user.id, receiver_id: receiverId }
      }
    });
  } catch (e) {
    console.warn('Falha ao criar notificação de amizade (ignorado):', e);
  }

  return data;
};

export const getPendingRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      *,
      sender:profiles!friend_requests_sender_id_fkey(full_name, avatar_url, email)
    `)
    .eq('status', 'pending')
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const respondToFriendRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Buscar solicitação para verificar permissão
  const { data: request } = await supabase
    .from('friend_requests')
    .select('sender_id, receiver_id, status')
    .eq('id', requestId)
    .single();

  if (!request) {
    throw new Error('Solicitação não encontrada');
  }

  if (request.receiver_id !== user.id) {
    throw new Error('Você não tem permissão para responder esta solicitação');
  }

  if (request.status !== 'pending') {
    throw new Error('Esta solicitação já foi respondida');
  }

  if (status === 'accepted') {
    const { data: result, error: fnError } = await supabase.functions.invoke('accept-friend-request', {
      body: { request_id: requestId }
    });
    if (fnError) throw fnError;
    return result?.request ?? null;
  }

  const { data, error } = await supabase
    .from('friend_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getFriendsList = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      user_id,
      friend_id,
      created_at,
      user:profiles!friendships_user_id_fkey(
        id:user_id,
        full_name,
        avatar_url,
        email,
        skill_level
      ),
      friend:profiles!friendships_friend_id_fkey(
        id:user_id,
        full_name,
        avatar_url,
        email,
        skill_level
      )
    `)
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Normaliza para sempre retornar o perfil do "outro" usuário em `friend`
  const normalized = (data || []).map((row: any) => {
    const isUserA = row.user_id === user.id;
    const otherProfile = isUserA ? row.friend : row.user;
    return {
      ...row,
      friend: otherProfile,
    };
  });

  return normalized;
};

export const removeFriend = async (friendshipId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  // Buscar amizade para obter friend_id
  const { data: friendship } = await supabase
    .from('friendships')
    .select('user_id, friend_id')
    .eq('id', friendshipId)
    .single();

  if (!friendship) {
    throw new Error('Amizade não encontrada');
  }

  if (friendship.user_id !== user.id) {
    throw new Error('Você não tem permissão para remover esta amizade');
  }

  // Deletar amizade bidirecional (ambas direções)
  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendship.friend_id}),and(user_id.eq.${friendship.friend_id},friend_id.eq.${user.id})`);

  if (error) throw error;
};