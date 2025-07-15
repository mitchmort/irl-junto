import { supabase } from '@/lib/supabase/server';
import { smsService } from '@/lib/twilio';
import { NotificationStatus } from '@/types/database';
import { TwilioWebhookStatus } from '@/lib/twilio/types';

export interface DeliveryStatus {
  notificationId: string;
  messageSid: string;
  status: NotificationStatus;
  errorCode?: string;
  errorMessage?: string;
  deliveredAt?: Date;
  updatedAt: Date;
}

export class DeliveryTracker {
  private static instance: DeliveryTracker;

  private constructor() {}

  public static getInstance(): DeliveryTracker {
    if (!DeliveryTracker.instance) {
      DeliveryTracker.instance = new DeliveryTracker();
    }
    return DeliveryTracker.instance;
  }

  // Handle Twilio webhook status updates
  async handleTwilioWebhook(webhookData: TwilioWebhookStatus): Promise<void> {
    try {
      // Find the notification by Twilio SID
      const { data: notification, error: findError } = await supabase
        .from('notifications_log')
        .select('*')
        .eq('twilio_sid', webhookData.MessageSid)
        .single();

      if (findError || !notification) {
        console.error('Notification not found for Twilio SID:', webhookData.MessageSid);
        return;
      }

      // Map Twilio status to our status
      const status = this.mapTwilioStatusToNotificationStatus(webhookData.MessageStatus);

      // Update notification status
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Add delivery timestamp for delivered messages
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      // Add error information if failed
      if (webhookData.ErrorCode || webhookData.ErrorMessage) {
        updateData.error_message = webhookData.ErrorMessage || `Error code: ${webhookData.ErrorCode}`;
      }

      const { error: updateError } = await supabase
        .from('notifications_log')
        .update(updateData)
        .eq('id', notification.id);

      if (updateError) {
        console.error('Failed to update notification status:', updateError);
      }

      // Handle failed deliveries
      if (status === 'failed' || status === 'undelivered') {
        await this.handleFailedDelivery(notification.id, webhookData);
      }
    } catch (error) {
      console.error('Error handling Twilio webhook:', error);
    }
  }

  // Get delivery status for a notification
  async getDeliveryStatus(notificationId: string): Promise<DeliveryStatus | null> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications_log')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (error || !notification) {
        console.error('Notification not found:', error);
        return null;
      }

      return {
        notificationId: notification.id,
        messageSid: notification.twilio_sid,
        status: notification.status as NotificationStatus,
        errorCode: notification.error_code,
        errorMessage: notification.error_message,
        deliveredAt: notification.delivered_at ? new Date(notification.delivered_at) : undefined,
        updatedAt: new Date(notification.updated_at),
      };
    } catch (error) {
      console.error('Error getting delivery status:', error);
      return null;
    }
  }

  // Sync delivery status with Twilio for pending messages
  async syncDeliveryStatus(): Promise<void> {
    try {
      // Get notifications that are sent but not yet delivered
      const { data: pendingNotifications, error } = await supabase
        .from('notifications_log')
        .select('*')
        .in('status', ['sent', 'sending'])
        .not('twilio_sid', 'is', null)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Failed to get pending notifications:', error);
        return;
      }

      if (!pendingNotifications || pendingNotifications.length === 0) {
        return;
      }

      // Check status for each notification
      for (const notification of pendingNotifications) {
        try {
          const statusResult = await smsService.getMessageStatus(notification.twilio_sid);
          
          if (statusResult.status !== notification.status) {
            // Update status if it changed
            const updateData: any = {
              status: statusResult.status,
              updated_at: new Date().toISOString(),
            };

            if (statusResult.status === 'delivered') {
              updateData.delivered_at = new Date().toISOString();
            }

            if (statusResult.error) {
              updateData.error_message = statusResult.error;
            }

            await supabase
              .from('notifications_log')
              .update(updateData)
              .eq('id', notification.id);
          }
        } catch (error) {
          console.error(`Failed to sync status for notification ${notification.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error syncing delivery status:', error);
    }
  }

  // Get delivery statistics
  async getDeliveryStats(timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    total: number;
    pending: number;
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
    failureRate: number;
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

      const { data: notifications, error } = await supabase
        .from('notifications_log')
        .select('status')
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Failed to get delivery stats:', error);
        return { total: 0, pending: 0, sent: 0, delivered: 0, failed: 0, deliveryRate: 0, failureRate: 0 };
      }

      const total = notifications?.length || 0;
      const pending = notifications?.filter(n => n.status === 'pending').length || 0;
      const sent = notifications?.filter(n => n.status === 'sent').length || 0;
      const delivered = notifications?.filter(n => n.status === 'delivered').length || 0;
      const failed = notifications?.filter(n => ['failed', 'undelivered'].includes(n.status)).length || 0;
      
      const deliveryRate = total > 0 ? (delivered / total) * 100 : 0;
      const failureRate = total > 0 ? (failed / total) * 100 : 0;

      return {
        total,
        pending,
        sent,
        delivered,
        failed,
        deliveryRate,
        failureRate,
      };
    } catch (error) {
      console.error('Error getting delivery stats:', error);
      return { total: 0, pending: 0, sent: 0, delivered: 0, failed: 0, deliveryRate: 0, failureRate: 0 };
    }
  }

  // Get failed deliveries for analysis
  async getFailedDeliveries(limit: number = 50): Promise<Array<{
    notificationId: string;
    userId: string;
    eventId?: number;
    type: string;
    errorMessage?: string;
    failedAt: Date;
    phoneNumber?: string;
  }>> {
    try {
      const { data: failures, error } = await supabase
        .from('notifications_log')
        .select(`
          id,
          user_id,
          event_id,
          type,
          error_message,
          updated_at,
          users(phone_number)
        `)
        .in('status', ['failed', 'undelivered'])
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get failed deliveries:', error);
        return [];
      }

      return failures?.map(failure => ({
        notificationId: failure.id,
        userId: failure.user_id,
        eventId: failure.event_id,
        type: failure.type,
        errorMessage: failure.error_message,
        failedAt: new Date(failure.updated_at),
        phoneNumber: (failure.users as any)?.phone_number,
      })) || [];
    } catch (error) {
      console.error('Error getting failed deliveries:', error);
      return [];
    }
  }

  // Retry failed deliveries
  async retryFailedDeliveries(notificationIds: string[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      for (const notificationId of notificationIds) {
        try {
          // Get the notification
          const { data: notification, error } = await supabase
            .from('notifications_log')
            .select('*, users(phone_number)')
            .eq('id', notificationId)
            .single();

          if (error || !notification) {
            results.failed++;
            results.errors.push(`Notification ${notificationId} not found`);
            continue;
          }

          const user = notification.users as any;
          if (!user || !user.phone_number) {
            results.failed++;
            results.errors.push(`User phone number not found for notification ${notificationId}`);
            continue;
          }

          // Retry sending
          const smsResult = await smsService.sendSMS({
            to: user.phone_number,
            body: notification.message,
            statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook/status`,
          });

          if (smsResult.success) {
            // Update notification status
            await supabase
              .from('notifications_log')
              .update({
                status: 'sent',
                twilio_sid: smsResult.messageSid,
                error_message: null,
                sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', notificationId);

            results.success++;
          } else {
            results.failed++;
            results.errors.push(`Retry failed for ${notificationId}: ${smsResult.error}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`Error retrying ${notificationId}: ${error}`);
        }
      }
    } catch (error) {
      results.errors.push(`Batch retry error: ${error}`);
    }

    return results;
  }

  // Private helper methods
  private mapTwilioStatusToNotificationStatus(twilioStatus: string): NotificationStatus {
    const statusMap: Record<string, NotificationStatus> = {
      'queued': 'pending',
      'sending': 'sending',
      'sent': 'sent',
      'delivered': 'delivered',
      'failed': 'failed',
      'undelivered': 'undelivered',
    };

    return statusMap[twilioStatus] || 'failed';
  }

  private async handleFailedDelivery(notificationId: string, webhookData: TwilioWebhookStatus): Promise<void> {
    try {
      // Log the failure for analysis
      console.warn(`SMS delivery failed for notification ${notificationId}:`, {
        messageSid: webhookData.MessageSid,
        errorCode: webhookData.ErrorCode,
        errorMessage: webhookData.ErrorMessage,
        to: webhookData.To,
      });

      // Here you could implement retry logic or alternative delivery methods
      // For now, just log the failure
    } catch (error) {
      console.error('Error handling failed delivery:', error);
    }
  }
}

// Export singleton instance
export const deliveryTracker = DeliveryTracker.getInstance();