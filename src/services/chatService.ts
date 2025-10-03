import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  player1_id: string;
  player2_id: string;
  created_at: string;
  updated_at: string;
  other_player?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message?: Message;
  unread_count?: number;
}

export const chatService = {
  async getOrCreateConversation(userId: string, otherUserId: string): Promise<Conversation | null> {
    try {
      // Check if conversation exists
      const { data: existing, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(player1_id.eq.${userId},player2_id.eq.${otherUserId}),and(player1_id.eq.${otherUserId},player2_id.eq.${userId})`)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          player1_id: userId,
          player2_id: otherUserId
        })
        .select()
        .single();

      if (createError) throw createError;

      return newConv;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      return null;
    }
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (!conversations) return [];

      // Get other player info and last message for each conversation
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherPlayerId = conv.player1_id === userId ? conv.player2_id : conv.player1_id;

          // Get other player profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', otherPlayerId)
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', userId);

          return {
            ...conv,
            other_player: profile ? {
              id: profile.user_id,
              full_name: profile.full_name || 'Usuário',
              avatar_url: profile.avatar_url
            } : undefined,
            last_message: lastMessage || undefined,
            unread_count: unreadCount || 0
          };
        })
      );

      return enrichedConversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for the other user
      const { data: conversation } = await supabase
        .from('conversations')
        .select('player1_id, player2_id')
        .eq('id', conversationId)
        .single();

      if (conversation) {
        const recipientId = conversation.player1_id === senderId 
          ? conversation.player2_id 
          : conversation.player1_id;

        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', senderId)
          .single();

        await supabase.functions.invoke('create-notification', {
          body: {
            user_id: recipientId,
            type: 'chat_message',
            title: 'Nova mensagem',
            message: `${senderProfile?.full_name || 'Alguém'} enviou uma mensagem`,
            data: { conversation_id: conversationId }
          }
        });
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};