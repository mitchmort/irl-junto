import { supabase } from '@/lib/supabase/server';
import { NotificationRequest } from './notification-service';
import { NotificationType } from '@/types/database';
import { addHours, subHours, isAfter, isBefore, parseISO } from 'date-fns';

export interface ScheduledNotification {
  id: string;
  userId: string;
  eventId: number;
  type: NotificationType;
  scheduledFor: Date;
  templateData: Record<string, any>;
}

export class NotificationScheduler {
  private static instance: NotificationScheduler;

  private constructor() {}

  public static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  // Schedule event reminders for all participants
  async scheduleEventReminders(eventId: number): Promise<void> {
    try {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        console.error('Event not found:', eventError);
        return;
      }

      // Get all confirmed participants
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (participantsError || !participants) {
        console.error('Failed to get participants:', participantsError);
        return;
      }

      // Calculate reminder times
      const eventDateTime = new Date(`${event.date} ${event.time}`);
      const reminderTimes = this.calculateReminderTimes(eventDateTime);

      // Schedule reminders for each participant
      for (const participant of participants) {
        await this.scheduleUserReminders(
          participant.user_id,
          eventId,
          event,
          reminderTimes
        );
      }
    } catch (error) {
      console.error('Failed to schedule event reminders:', error);
    }
  }

  // Schedule reminders for a specific user
  private async scheduleUserReminders(
    userId: string,
    eventId: number,
    event: any,
    reminderTimes: { reminderTime24h: Date; reminderTime2h: Date }
  ): Promise<void> {
    try {
      // Check user's notification preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError || !preferences) {
        console.error('Failed to get user preferences:', preferencesError);
        return;
      }

      const templateData = {
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        location: event.location,
        sport: event.sport,
      };

      // Schedule 24-hour reminder
      if (preferences.sms_reminders && preferences.reminder_24h) {
        await this.scheduleNotification({
          userId,
          eventId,
          type: 'reminder_24h',
          channel: 'sms',
          templateData,
          scheduledFor: reminderTimes.reminderTime24h,
        });
      }

      // Schedule 2-hour reminder
      if (preferences.sms_reminders && preferences.reminder_2h) {
        await this.scheduleNotification({
          userId,
          eventId,
          type: 'reminder_2h',
          channel: 'sms',
          templateData,
          scheduledFor: reminderTimes.reminderTime2h,
        });
      }
    } catch (error) {
      console.error('Failed to schedule user reminders:', error);
    }
  }

  // Schedule a single notification
  async scheduleNotification(request: NotificationRequest): Promise<string | null> {
    try {
      // Check if notification already exists
      const { data: existingNotification } = await supabase
        .from('notifications_log')
        .select('id')
        .eq('user_id', request.userId)
        .eq('event_id', request.eventId || 0)
        .eq('type', request.type)
        .eq('status', 'pending')
        .single();

      if (existingNotification) {
        console.log('Notification already scheduled');
        return existingNotification.id;
      }

      // Generate message from template
      const message = await this.generateMessage(request.type, request.templateData);

      // Create notification log entry
      const { data: notificationLog, error: logError } = await supabase
        .from('notifications_log')
        .insert({
          user_id: request.userId,
          event_id: request.eventId,
          type: request.type,
          channel: request.channel,
          message,
          status: 'pending',
          scheduled_for: request.scheduledFor?.toISOString(),
        })
        .select()
        .single();

      if (logError) {
        console.error('Failed to create notification log:', logError);
        return null;
      }

      return notificationLog.id;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  // Calculate reminder times based on event date/time
  private calculateReminderTimes(eventDateTime: Date): {
    reminderTime24h: Date;
    reminderTime2h: Date;
  } {
    const reminderTime24h = subHours(eventDateTime, 24);
    const reminderTime2h = subHours(eventDateTime, 2);

    return {
      reminderTime24h,
      reminderTime2h,
    };
  }

  // Get upcoming events that need reminders scheduled
  async getEventsNeedingReminders(): Promise<any[]> {
    try {
      const now = new Date();
      const in48Hours = addHours(now, 48);

      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', now.toISOString().split('T')[0])
        .lte('date', in48Hours.toISOString().split('T')[0])
        .eq('status', 'active');

      if (error) {
        console.error('Failed to get events needing reminders:', error);
        return [];
      }

      return events || [];
    } catch (error) {
      console.error('Failed to get events needing reminders:', error);
      return [];
    }
  }

  // Get notifications ready to be sent
  async getNotificationsReadyToSend(): Promise<any[]> {
    try {
      const now = new Date();

      const { data: notifications, error } = await supabase
        .from('notifications_log')
        .select('*, users(phone_number, name)')
        .eq('status', 'pending')
        .lte('scheduled_for', now.toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Failed to get notifications ready to send:', error);
        return [];
      }

      return notifications || [];
    } catch (error) {
      console.error('Failed to get notifications ready to send:', error);
      return [];
    }
  }

  // Cancel scheduled notifications for an event
  async cancelEventNotifications(eventId: number, type?: NotificationType): Promise<void> {
    try {
      const query = supabase
        .from('notifications_log')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('status', 'pending');

      if (type) {
        query.eq('type', type);
      }

      const { error } = await query;

      if (error) {
        console.error('Failed to cancel notifications:', error);
      }
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  // Reschedule notifications for an event (when event time changes)
  async rescheduleEventNotifications(eventId: number, newDateTime: Date): Promise<void> {
    try {
      // Cancel existing notifications
      await this.cancelEventNotifications(eventId);

      // Schedule new notifications
      await this.scheduleEventReminders(eventId);
    } catch (error) {
      console.error('Failed to reschedule notifications:', error);
    }
  }

  // Clean up old notifications
  async cleanupOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { error } = await supabase
        .from('notifications_log')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString())
        .in('status', ['sent', 'delivered', 'failed']);

      if (error) {
        console.error('Failed to clean up old notifications:', error);
      }
    } catch (error) {
      console.error('Failed to clean up old notifications:', error);
    }
  }

  // Get notification statistics
  async getNotificationStats(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
  }> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data: stats, error } = await supabase
        .from('notifications_log')
        .select('status')
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Failed to get notification stats:', error);
        return { total: 0, sent: 0, delivered: 0, failed: 0, deliveryRate: 0 };
      }

      const total = stats?.length || 0;
      const sent = stats?.filter(s => s.status === 'sent').length || 0;
      const delivered = stats?.filter(s => s.status === 'delivered').length || 0;
      const failed = stats?.filter(s => s.status === 'failed').length || 0;
      const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;

      return {
        total,
        sent,
        delivered,
        failed,
        deliveryRate,
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return { total: 0, sent: 0, delivered: 0, failed: 0, deliveryRate: 0 };
    }
  }

  // Helper method to generate message (placeholder)
  private async generateMessage(type: NotificationType, templateData: Record<string, any>): Promise<string> {
    // This would use the TemplateService
    return `Notification message for ${type}`;
  }
}

// Export singleton instance
export const notificationScheduler = NotificationScheduler.getInstance();