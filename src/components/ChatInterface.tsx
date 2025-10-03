import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { Card } from './ui/card';

export const ChatInterface = () => {
  const { conversations, loading } = useChat();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
  };

  return (
    <Card className="h-[600px] overflow-hidden">
      <div className="grid md:grid-cols-[350px,1fr] h-full">
        {/* Lista de conversas - sempre visível no desktop, escondida no mobile quando chat aberto */}
        <div className={`border-r ${showChat ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Mensagens</h2>
          </div>
          <ChatList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            loading={loading}
          />
        </div>

        {/* Janela de chat - visível quando uma conversa está selecionada */}
        <div className={`${showChat ? 'block' : 'hidden md:block'}`}>
          <ChatWindow
            conversation={selectedConversation}
            onBack={handleBack}
          />
        </div>
      </div>
    </Card>
  );
};