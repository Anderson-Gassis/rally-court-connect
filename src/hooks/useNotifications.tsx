import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { notificationsService, type Notification } from '@/services/notificationsService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await notificationsService.getNotifications();
    setNotifications(data);
    const count = await notificationsService.getUnreadCount();
    setUnreadCount(count);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          console.log('Notification change detected, refreshing...');
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    await notificationsService.markAsRead(notificationId);
    await fetchNotifications();
  };

  const markAllAsRead = async () => {
    await notificationsService.markAllAsRead();
    await fetchNotifications();
  };

  const deleteNotification = async (notificationId: string) => {
    await notificationsService.deleteNotification(notificationId);
    await fetchNotifications();
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications
  };
};
