
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface UserNotification {
  id: string;
  user_id: string;
  report_id: string;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Get notifications for the current user
 * 
 * @param limit Maximum number of notifications to return
 * @returns List of notifications
 */
export const getUserNotifications = async (limit: number = 10): Promise<UserNotification[]> => {
  try {
    const user = supabase.auth.getUser();
    if (!(await user).data.user) {
      console.log("No authenticated user");
      return [];
    }
    
    const userId = (await user).data.user.id;
    
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
    
    return data as UserNotification[];
  } catch (error) {
    console.error("Error in getUserNotifications:", error);
    return [];
  }
};

/**
 * Mark a notification as read
 * 
 * @param notificationId Notification ID
 * @returns Success status
 */
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    return false;
  }
};

/**
 * Mark all notifications as read for the current user
 * 
 * @returns Success status
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const user = supabase.auth.getUser();
    if (!(await user).data.user) {
      return false;
    }
    
    const userId = (await user).data.user.id;
    
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead:", error);
    return false;
  }
};

/**
 * Get unread notifications count
 * 
 * @returns Count of unread notifications
 */
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const user = supabase.auth.getUser();
    if (!(await user).data.user) {
      return 0;
    }
    
    const userId = (await user).data.user.id;
    
    const { count, error } = await supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) {
      console.error("Error counting unread notifications:", error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("Error in getUnreadNotificationsCount:", error);
    return 0;
  }
};
