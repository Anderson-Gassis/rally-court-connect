import React from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const NotificationsDropdown = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge':
        return '🎾';
      case 'match_result':
        return '🏆';
      case 'tournament':
        return '🏅';
      default:
        return '📬';
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Marcar como lida
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navegar para a área correspondente baseado no tipo de notificação
    if (notification.type === 'challenge') {
      // Redirecionar para a dashboard do usuário na aba de jogos
      if (user?.role === 'player') {
        navigate('/player/dashboard?tab=games');
      } else if (user?.role === 'partner') {
        navigate('/partner/dashboard?tab=games');
      } else if (user?.role === 'instructor') {
        navigate('/instructor/dashboard?tab=games');
      }
    } else if (notification.type === 'tournament') {
      // Se houver um ID de torneio na notificação, ir direto para os detalhes
      if (notification.data?.tournament_id) {
        navigate(`/tournaments/${notification.data.tournament_id}`);
      } else {
        navigate('/tournaments');
      }
    } else if (notification.type === 'match_result') {
      if (user?.role === 'player') {
        navigate('/player/dashboard?tab=history');
      }
    } else if (notification.type === 'booking') {
      if (user?.role === 'player') {
        navigate('/player/dashboard?tab=bookings');
      } else if (user?.role === 'partner') {
        navigate('/partner/dashboard?tab=bookings');
      }
    } else {
      // Fallback para tipos de notificação não especificados
      if (user?.role === 'player') {
        navigate('/player/dashboard');
      } else if (user?.role === 'partner') {
        navigate('/partner/dashboard');
      } else if (user?.role === 'instructor') {
        navigate('/instructor/dashboard');
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando notificações...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b hover:bg-accent cursor-pointer ${
                  !notification.read ? 'bg-accent/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
