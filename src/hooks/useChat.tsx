import { useState, useEffect } from 'react';
import { chatService, Conversation, Message } from '@/services/chatService';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await chatService.getConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as conversas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (otherUserId: string) => {
    if (!user) return null;

    try {
      const conversation = await chatService.getOrCreateConversation(user.id, otherUserId);
      if (conversation) {
        await loadConversations();
      }
      return conversation;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível iniciar a conversa',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    conversations,
    loading,
    startConversation,
    refreshConversations: loadConversations
  };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      
      // Subscribe to new messages
      const unsubscribe = chatService.subscribeToMessages(conversationId, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        
        // Mark as read if not from current user
        if (user && newMessage.sender_id !== user.id) {
          chatService.markMessagesAsRead(conversationId, user.id);
        }
      });

      return unsubscribe;
    }
  }, [conversationId, user]);

  const loadMessages = async () => {
    if (!conversationId || !user) return;

    setLoading(true);
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(data);
      
      // Mark messages as read
      await chatService.markMessagesAsRead(conversationId, user.id);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as mensagens',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) return;

    setSending(true);
    try {
      await chatService.sendMessage(conversationId, user.id, content);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage
  };
};