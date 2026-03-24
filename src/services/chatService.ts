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

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
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

  /**
   * Optimized: fetches all conversations in a single query, then resolves
   * other_player, last_message, and unread_count with 3 batched queries
   * instead of (3 × N) individual queries.
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!conversations || conversations.length === 0) return [];

      const convIds = conversations.map(c => c.id);

      // Collect all other-player IDs
      const otherPlayerIds = conversations.map(c =>
        c.player1_id === userId ? c.player2_id : c.player1_id
      );

      // Batch 1: Fetch all needed profiles in one query
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', [...new Set(otherPlayerIds)]);

      // Batch 2: Fetch last message per conversation
      // Supabase doesn't support DISTINCT ON in client, so we fetch recent messages
      // and pick the latest per conversation in JS.
      const { data: recentMessages } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, content, read, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false })
        .limit(convIds.length * 5); // generous buffer to get last msg per conv

      // Batch 3: Fetch unread counts per conversation
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', convIds)
        .eq('read', false)
        .neq('sender_id', userId);

      // Build lookup maps
      const profileMap = new Map<string, ProfileRow>(
        ((profiles ?? []) as ProfileRow[]).map(p => [p.user_id, p])
      );

      const lastMessageMap = new Map<string, Message>();
      for (const msg of recentMessages ?? []) {
        if (!lastMessageMap.has(msg.conversation_id)) {
          lastMessageMap.set(msg.conversation_id, msg as Message);
        }
      }

      const unreadCountMap = new Map<string, number>();
      for (const msg of unreadMessages ?? []) {
        unreadCountMap.set(
          msg.conversation_id,
          (unreadCountMap.get(msg.conversation_id) ?? 0) + 1
        );
      }

      return conversations.map(conv => {
        const otherPlayerId = conv.player1_id === userId ? conv.player2_id : conv.player1_id;
        const profile = profileMap.get(otherPlayerId);

        return {
          ...conv,
          other_player: profile
            ? {
                id: profile.user_id,
                full_name: profile.full_name || 'Usuário',
                avatar_url: profile.avatar_url,
              }
            : undefined,
          last_message: lastMessageMap.get(conv.id),
          unread_count: unreadCountMap.get(conv.id) ?? 0,
        };
      });
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

      // Update conversation's updated_at so it floats to the top of the list
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Create notification for the other user (non-blocking)
      supabase
        .from('conversations')
        .select('player1_id, player2_id')
        .eq('id', conversationId)
        .single()
        .then(({ data: conversation }) => {
          if (!conversation) return;
          const recipientId = conversation.player1_id === senderId
            ? conversation.player2_id
            : conversation.player1_id;

          supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', senderId)
            .single()
            .then(({ data: senderProfile }) => {
              supabase.functions.invoke('create-notification', {
                body: {
                  user_id: recipientId,
                  type: 'chat_message',
                  title: 'Nova mensagem',
                  message: `${senderProfile?.full_name || 'Alguém'} enviou uma mensagem`,
                  data: { conversation_id: conversationId }
                }
              });
            });
        });

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