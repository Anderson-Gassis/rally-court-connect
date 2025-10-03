import { useState, useEffect, useRef } from 'react';
import { Send, User, ArrowLeft } from 'lucide-react';
import { useMessages } from '@/hooks/useChat';
import { Conversation } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatWindowProps {
  conversation: Conversation | null;
  onBack: () => void;
}

export const ChatWindow = ({ conversation, onBack }: ChatWindowProps) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const { messages, loading, sending, sendMessage } = useMessages(conversation?.id || null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    await sendMessage(messageText);
    setMessageText('');
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Selecione uma conversa para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.other_player?.avatar_url || ''} />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-semibold">
            {conversation.other_player?.full_name || 'Usuário'}
          </h3>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Carregando mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              Nenhuma mensagem ainda.<br />Envie uma mensagem para começar!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {format(new Date(message.created_at), 'HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={sending}
            className="flex-1"
            maxLength={500}
          />
          <Button type="submit" disabled={!messageText.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};