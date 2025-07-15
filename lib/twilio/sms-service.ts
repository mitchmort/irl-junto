import { twilioClient, TWILIO_PHONE_NUMBER } from './client';
import { normalizePhoneNumber, validatePhoneNumber } from './phone-utils';
import { NotificationLogInsert, NotificationStatus } from '@/types/database';
import { supabase } from '@/lib/supabase/server';

export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
  statusCallback?: string;
}

export interface SMSResult {
  success: boolean;
  messageSid?: string;
  error?: string;
  status?: string;
}

export class SMSService {
  private static instance: SMSService;
  private rateLimitTracker: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  // Send SMS message
  async sendSMS(message: SMSMessage): Promise<SMSResult> {
    try {
      // Validate phone number
      const validation = validatePhoneNumber(message.to);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error || 'Invalid phone number',
        };
      }

      const normalizedTo = validation.normalized!;

      // Check rate limits
      if (!(await this.checkRateLimit(normalizedTo))) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        };
      }

      // Send SMS via Twilio
      const twilioMessage = await twilioClient.messages.create({
        body: message.body,
        from: message.from || TWILIO_PHONE_NUMBER,
        to: normalizedTo,
        statusCallback: message.statusCallback,
      });

      // Update rate limit tracker
      this.updateRateLimit(normalizedTo);

      return {
        success: true,
        messageSid: twilioMessage.sid,
        status: twilioMessage.status,
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: this.parseError(error),
      };
    }
  }

  // Send verification code
  async sendVerificationCode(phoneNumber: string, code: string): Promise<SMSResult> {
    const message = `Your Junto verification code is: ${code}. This code expires in 10 minutes.`;
    
    return this.sendSMS({
      to: phoneNumber,
      body: message,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook/status`,
    });
  }

  // Send event reminder
  async sendEventReminder(
    phoneNumber: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    location: string,
    reminderType: '24h' | '2h'
  ): Promise<SMSResult> {
    const timeText = reminderType === '24h' ? 'tomorrow' : 'in 2 hours';
    const emoji = reminderType === '24h' ? '📅' : '⏰';
    
    const message = `${emoji} Game reminder: ${eventTitle} ${timeText} at ${eventTime} at ${location}. See you there!`;
    
    return this.sendSMS({
      to: phoneNumber,
      body: message,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook/status`,
    });
  }

  // Send event update notification
  async sendEventUpdate(
    phoneNumber: string,
    eventTitle: string,
    updateType: 'location' | 'time' | 'cancelled',
    newValue?: string
  ): Promise<SMSResult> {
    let message: string;
    
    switch (updateType) {
      case 'location':
        message = `📍 Location changed: ${eventTitle} moved to ${newValue}`;
        break;
      case 'time':
        message = `⏰ Time update: ${eventTitle} now starts at ${newValue}`;
        break;
      case 'cancelled':
        message = `❌ Cancelled: ${eventTitle} has been cancelled. Sorry for the inconvenience.`;
        break;
      default:
        message = `📢 Update: ${eventTitle} has been updated. Check the event page for details.`;
    }
    
    return this.sendSMS({
      to: phoneNumber,
      body: message,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook/status`,
    });
  }

  // Send organizer message
  async sendOrganizerMessage(
    phoneNumber: string,
    organizerName: string,
    eventTitle: string,
    message: string
  ): Promise<SMSResult> {
    const smsMessage = `📧 Message from ${organizerName} about ${eventTitle}: ${message}`;
    
    return this.sendSMS({
      to: phoneNumber,
      body: smsMessage,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/webhook/status`,
    });
  }

  // Check rate limit (30 messages per minute per phone number)
  private async checkRateLimit(phoneNumber: string): Promise<boolean> {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    
    const timestamps = this.rateLimitTracker.get(phoneNumber) || [];
    const recentTimestamps = timestamps.filter(timestamp => timestamp > oneMinuteAgo);
    
    return recentTimestamps.length < 30;
  }

  // Update rate limit tracker
  private updateRateLimit(phoneNumber: string): void {
    const now = Date.now();
    const timestamps = this.rateLimitTracker.get(phoneNumber) || [];
    
    // Add current timestamp
    timestamps.push(now);
    
    // Keep only timestamps from the last minute
    const oneMinuteAgo = now - 60 * 1000;
    const recentTimestamps = timestamps.filter(timestamp => timestamp > oneMinuteAgo);
    
    this.rateLimitTracker.set(phoneNumber, recentTimestamps);
  }

  // Parse Twilio error
  private parseError(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 21211:
          return 'Invalid phone number format';
        case 21408:
          return 'Permission denied for this phone number';
        case 21612:
          return 'The phone number cannot receive SMS messages';
        case 21614:
          return 'Phone number is not a valid mobile number';
        default:
          return error.message || 'SMS sending failed';
      }
    }
    return error.message || 'Unknown error occurred';
  }

  // Get message delivery status
  async getMessageStatus(messageSid: string): Promise<{
    status: NotificationStatus;
    error?: string;
  }> {
    try {
      const message = await twilioClient.messages(messageSid).fetch();
      
      const statusMap: Record<string, NotificationStatus> = {
        'queued': 'pending',
        'sending': 'sending',
        'sent': 'sent',
        'delivered': 'delivered',
        'failed': 'failed',
        'undelivered': 'undelivered',
      };
      
      return {
        status: statusMap[message.status] || 'failed',
        error: message.errorMessage || undefined,
      };
    } catch (error) {
      console.error('Failed to get message status:', error);
      return {
        status: 'failed',
        error: 'Failed to retrieve message status',
      };
    }
  }

  // Log SMS notification to database
  async logNotification(log: NotificationLogInsert): Promise<void> {
    try {
      await supabase
        .from('notifications_log')
        .insert(log);
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  // Batch send SMS messages
  async sendBatchSMS(messages: SMSMessage[]): Promise<SMSResult[]> {
    const results: SMSResult[] = [];
    
    // Process messages in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(message => this.sendSMS(message))
      );
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: `Batch processing failed: ${result.reason}`,
          });
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < messages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}