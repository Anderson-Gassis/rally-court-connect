import { MessageSquare, User } from 'lucide-react';
import { Conversation } from '@/services/chatService';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  loading: boolean;
}

export const ChatList = ({ conversations, selectedConversationId, onSelectConversation, loading }: ChatListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          Carregando conversas...
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma conversa</h3>
        <p className="text-sm text-muted-foreground">
          Suas conversas com outros jogadores aparecerão aqui
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
              selectedConversationId === conversation.id ? 'bg-muted' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.other_player?.avatar_url || ''} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm truncate">
                    {conversation.other_player?.full_name || 'Usuário'}
                  </h4>
                  {conversation.last_message && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {format(new Date(conversation.last_message.created_at), 'HH:mm', { locale: ptBR })}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message?.content || 'Nenhuma mensagem ainda'}
                  </p>
                  {conversation.unread_count! > 0 && (
                    <Badge variant="default" className="ml-2 h-5 min-w-5 rounded-full">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};