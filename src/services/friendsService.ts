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

  const { data, error } = await supabase
    .from('friend_requests')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPendingRequests = async () => {
  const { data, error } = await supabase
    .from('friend_requests')
    .select(`
      *,
      sender:profiles!friend_requests_sender_id_fkey(full_name, avatar_url, email)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const respondToFriendRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
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
  const { data, error } = await supabase
    .from('friendships')
    .select(`
      *,
      friend:profiles!friendships_friend_id_fkey(
        id:user_id,
        full_name,
        avatar_url,
        email,
        skill_level
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const removeFriend = async (friendshipId: string) => {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) throw error;
};