
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  report_id: string | null;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Use type assertion to work around TypeScript limitations
        const { data, error } = await supabase
          .from('officer_notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5) as unknown as { data: Notification[] | null; error: any };

        if (error) throw error;
        
        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
        
        // Store notifications in session storage for persistence
        sessionStorage.setItem('officer_notifications', JSON.stringify(data || []));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        
        // Try to load from session storage if available
        const storedNotifications = sessionStorage.getItem('officer_notifications');
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications);
          setNotifications(parsedNotifications);
          setUnreadCount(parsedNotifications.filter((n: Notification) => !n.is_read).length || 0);
        }
      }
    };

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'officer_notifications' 
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
          setUnreadCount(prev => prev + 1);
          
          // Update session storage
          const currentNotifications = JSON.parse(sessionStorage.getItem('officer_notifications') || '[]');
          sessionStorage.setItem(
            'officer_notifications', 
            JSON.stringify([newNotification, ...currentNotifications.slice(0, 4)])
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string, reportId: string | null = null) => {
    try {
      // Use type assertion to work around TypeScript limitations
      await supabase
        .from('officer_notifications')
        .update({ is_read: true })
        .eq('id', id) as unknown as { data: any; error: any };
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update session storage
      const currentNotifications = JSON.parse(sessionStorage.getItem('officer_notifications') || '[]');
      const updatedNotifications = currentNotifications.map((n: Notification) => 
        n.id === id ? { ...n, is_read: true } : n
      );
      sessionStorage.setItem('officer_notifications', JSON.stringify(updatedNotifications));
      
      // Navigate to the appropriate page if reportId exists
      if (reportId) {
        navigate(`/officer-dashboard?tab=reports`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);
      
      if (unreadIds.length === 0) return;

      // Use type assertion to work around TypeScript limitations
      await supabase
        .from('officer_notifications')
        .update({ is_read: true })
        .in('id', unreadIds) as unknown as { data: any; error: any };
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      // Update session storage
      const currentNotifications = JSON.parse(sessionStorage.getItem('officer_notifications') || '[]');
      const updatedNotifications = currentNotifications.map((n: Notification) => ({ ...n, is_read: true }));
      sessionStorage.setItem('officer_notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Handle notification click based on its type
  const handleNotificationClick = (notification: Notification) => {
    // First mark as read
    markAsRead(notification.id, notification.report_id);
    
    // Then navigate based on notification type
    switch (notification.notification_type) {
      case 'new_report':
        navigate(`/officer-dashboard?tab=reports`);
        break;
      case 'kyc_verification':
        navigate(`/officer-dashboard?tab=kyc`);
        break;
      case 'sos_alert':
        navigate(`/officer-dashboard?tab=alerts`);
        break;
      default:
        // For other types, just navigate to dashboard
        navigate('/officer-dashboard');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="link" 
              size="sm" 
              className="text-xs h-auto p-0"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center w-full">
                  <span className="font-medium">
                    {notification.notification_type === 'new_report' 
                      ? 'New Report'
                      : notification.notification_type === 'kyc_verification'
                        ? 'KYC Verification'
                        : notification.notification_type === 'sos_alert'
                          ? 'SOS Alert'
                          : 'Notification'}
                  </span>
                  {!notification.is_read && (
                    <Badge className="ml-2 bg-blue-500">New</Badge>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => navigate('/officer-dashboard')}
              >
                View all notifications
              </Button>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No new notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
