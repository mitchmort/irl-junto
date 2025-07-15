import { supabase } from '@/lib/supabase/server';
import { smsService } from '@/lib/twilio';
import { 
  NotificationLogInsert, 
  NotificationType, 
  NotificationChannel,
  NotificationStatus,
  Event,
  User,
  NotificationPreferences 
} from '@/types/database';
import { TemplateService } from './template-service';
import { format } from 'date-fns';

export interface NotificationRequest {
  userId: string;
  eventId?: number;
  type: NotificationType;
  channel: NotificationChannel;
  templateData: Record<string, any>;
  scheduledFor?: Date;
  priority?: 'high' | 'medium' | 'low';
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
  messageSid?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private templateService: TemplateService;

  private constructor() {
    this.templateService = TemplateService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Send single notification
  async sendNotification(request: NotificationRequest): Promise<NotificationResult> {
    try {
      // Get user and their preferences
      const { user, preferences } = await this.getUserAndPreferences(request.userId);
      if (!user || !preferences) {
        return {
          success: false,
          error: 'User not found or no preferences set',
        };
      }

      // Check if user has opted out of this type of notification
      if (!this.isNotificationAllowed(request.type, preferences)) {
        return {
          success: false,
          error: 'User has opted out of this notification type',
        };
      }

      // Generate message from template
      const message = await this.templateService.generateMessage(
        request.type,
        request.templateData
      );

      // Create notification log entry
      const notificationLog: NotificationLogInsert = {
        user_id: request.userId,
        event_id: request.eventId,
        type: request.type,
        channel: request.channel,
        message,
        status: 'pending',
        scheduled_for: request.scheduledFor?.toISOString(),
      };

      // Insert notification log
      const { data: logData, error: logError } = await supabase
        .from('notifications_log')
        .insert(notificationLog)
        .select()
        .single();

      if (logError) {
        console.error('Failed to create notification log:', logError);
        return {
          success: false,
          error: 'Failed to create notification log',
        };
      }

      // Send immediately if not scheduled
      if (!request.scheduledFor) {
        const result = await this.sendImmediateNotification(
          user,
          message,
          request.channel,
          logData.id
        );
        return {
          success: result.success,
          notificationId: logData.id,
          error: result.error,
          messageSid: result.messageSid,
        };
      }

      // Return success for scheduled notifications
      return {
        success: true,
        notificationId: logData.id,
      };
    } catch (error) {
      console.error('Notification service error:', error);
      return {
        success: false,
        error: 'Failed to send notification',
      };
    }
  }

  // Send batch notifications
  async sendBatchNotifications(requests: NotificationRequest[]): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(request => this.sendNotification(request))
      );
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: `Batch processing failed: ${result.reason}`,
          });
        }
      });
      
      // Add delay between batches
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Send phone verification
  async sendPhoneVerification(userId: string, phoneNumber: string, code: string): Promise<NotificationResult> {
    return this.sendNotification({
      userId,
      type: 'phone_verification',
      channel: 'sms',
      templateData: {
        code,
        phoneNumber,
      },
    });
  }

  // Send event reminder
  async sendEventReminder(
    userId: string,
    eventId: number,
    reminderType: 'reminder_24h' | 'reminder_2h'
  ): Promise<NotificationResult> {
    try {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return {
          success: false,
          error: 'Event not found',
        };
      }

      // Format event date and time
      const eventDate = new Date(event.date);
      const eventTime = event.time;
      const formattedDate = format(eventDate, 'MMMM d, yyyy');

      return this.sendNotification({
        userId,
        eventId,
        type: reminderType,
        channel: 'sms',
        templateData: {
          eventTitle: event.title,
          eventDate: formattedDate,
          eventTime,
          location: event.location,
          sport: event.sport,
        },
      });
    } catch (error) {
      console.error('Failed to send event reminder:', error);
      return {
        success: false,
        error: 'Failed to send event reminder',
      };
    }
  }

  // Send event update notification
  async sendEventUpdate(
    eventId: number,
    updateType: 'location' | 'time' | 'cancelled',
    newValue?: string
  ): Promise<NotificationResult[]> {
    try {
      // Get event and participants
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return [{
          success: false,
          error: 'Event not found',
        }];
      }

      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (participantsError || !participants) {
        return [{
          success: false,
          error: 'Failed to get participants',
        }];
      }

      // Create notification requests for all participants
      const requests: NotificationRequest[] = participants.map(participant => ({
        userId: participant.user_id,
        eventId,
        type: 'event_update',
        channel: 'sms',
        templateData: {
          eventTitle: event.title,
          updateType,
          newValue,
        },
      }));

      return this.sendBatchNotifications(requests);
    } catch (error) {
      console.error('Failed to send event update:', error);
      return [{
        success: false,
        error: 'Failed to send event update',
      }];
    }
  }

  // Send organizer message
  async sendOrganizerMessage(
    eventId: number,
    senderId: string,
    message: string
  ): Promise<NotificationResult[]> {
    try {
      // Get event and organizer info
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError || !event) {
        return [{
          success: false,
          error: 'Event not found',
        }];
      }

      const { data: organizer, error: organizerError } = await supabase
        .from('users')
        .select('name')
        .eq('id', senderId)
        .single();

      if (organizerError || !organizer) {
        return [{
          success: false,
          error: 'Organizer not found',
        }];
      }

      // Get participants (excluding the organizer)
      const { data: participants, error: participantsError } = await supabase
        .from('event_participants')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
        .neq('user_id', senderId);

      if (participantsError || !participants) {
        return [{
          success: false,
          error: 'Failed to get participants',
        }];
      }

      // Store message in event_messages table
      await supabase
        .from('event_messages')
        .insert({
          event_id: eventId,
          sender_id: senderId,
          message,
          message_type: 'organizer_message',
        });

      // Create notification requests for all participants
      const requests: NotificationRequest[] = participants.map(participant => ({
        userId: participant.user_id,
        eventId,
        type: 'organizer_message',
        channel: 'sms',
        templateData: {
          organizerName: organizer.name || 'Organizer',
          eventTitle: event.title,
          message,
        },
      }));

      return this.sendBatchNotifications(requests);
    } catch (error) {
      console.error('Failed to send organizer message:', error);
      return [{
        success: false,
        error: 'Failed to send organizer message',
      }];
    }
  }

  // Process scheduled notifications
  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();
      
      // Get pending notifications that are due
      const { data: pendingNotifications, error } = await supabase
        .from('notifications_log')
        .select('*, users(phone_number)')
        .eq('status', 'pending')
        .lte('scheduled_for', now.toISOString())
        .limit(100);

      if (error) {
        console.error('Failed to get pending notifications:', error);
        return;
      }

      if (!pendingNotifications || pendingNotifications.length === 0) {
        return;
      }

      // Process each notification
      for (const notification of pendingNotifications) {
        try {
          const user = notification.users as unknown as User;
          if (!user || !user.phone_number) {
            await this.updateNotificationStatus(notification.id, 'failed', 'User phone number not found');
            continue;
          }

          const result = await this.sendImmediateNotification(
            user,
            notification.message,
            notification.channel as NotificationChannel,
            notification.id
          );

          if (!result.success) {
            await this.updateNotificationStatus(notification.id, 'failed', result.error);
          }
        } catch (error) {
          console.error(`Failed to process notification ${notification.id}:`, error);
          await this.updateNotificationStatus(notification.id, 'failed', 'Processing error');
        }
      }
    } catch (error) {
      console.error('Failed to process scheduled notifications:', error);
    }
  }

  // Private helper methods
  private async getUserAndPreferences(userId: string): Promise<{
    user: User | null;
    preferences: NotificationPreferences | null;
  }> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      return { user: null, preferences: null };
    }

    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (preferencesError) {
      return { user, preferences: null };
    }

    return { user, preferences };
  }

  private isNotificationAllowed(type: NotificationType, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'phone_verification':
        return true; // Always allow verification
      case 'reminder_24h':
        return preferences.sms_reminders && preferences.reminder_24h;
      case 'reminder_2h':
        return preferences.sms_reminders && preferences.reminder_2h;
      case 'event_update':
        return preferences.sms_event_updates;
      case 'organizer_message':
        return preferences.sms_organizer_messages;
      default:
        return false;
    }
  }

  private async sendImmediateNotification(
    user: User,
    message: string,
    channel: NotificationChannel,
    notificationId: string
  ): Promise<{ success: boolean; error?: string; messageSid?: string }> {
    if (channel === 'sms') {
      // Update status to sending
      await this.updateNotificationStatus(notificationId, 'sending');

      const result = await smsService.sendSMS({
        to: user.phone_number,
        body: message,
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook/status`,
      });

      if (result.success) {
        await this.updateNotificationStatus(
          notificationId,
          'sent',
          undefined,
          result.messageSid,
          new Date()
        );
        return { success: true, messageSid: result.messageSid };
      } else {
        await this.updateNotificationStatus(notificationId, 'failed', result.error);
        return { success: false, error: result.error };
      }
    }

    // Email channel (placeholder for future implementation)
    return { success: false, error: 'Email channel not implemented' };
  }

  private async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus,
    error?: string,
    twilioSid?: string,
    sentAt?: Date
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (error) updateData.error_message = error;
    if (twilioSid) updateData.twilio_sid = twilioSid;
    if (sentAt) updateData.sent_at = sentAt.toISOString();

    await supabase
      .from('notifications_log')
      .update(updateData)
      .eq('id', notificationId);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();