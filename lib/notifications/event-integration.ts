import { supabase } from '@/lib/supabase/server';
import { notificationManager } from '@/lib/notifications';
import { Event, EventParticipant } from '@/types/database';

export class EventNotificationIntegration {
  private static instance: EventNotificationIntegration;

  private constructor() {}

  public static getInstance(): EventNotificationIntegration {
    if (!EventNotificationIntegration.instance) {
      EventNotificationIntegration.instance = new EventNotificationIntegration();
    }
    return EventNotificationIntegration.instance;
  }

  // Handle event creation
  async handleEventCreated(event: Event): Promise<void> {
    try {
      // Check if event is in the future
      const eventDateTime = new Date(`${event.date} ${event.time}`);
      const now = new Date();
      
      if (eventDateTime <= now) {
        console.log('Event is in the past, not scheduling reminders');
        return;
      }

      // Schedule reminders for the event
      await notificationManager.scheduleEventReminders(event.id);
      
      console.log(`Reminders scheduled for event ${event.id}`);
    } catch (error) {
      console.error('Failed to handle event creation:', error);
    }
  }

  // Handle participant joining event
  async handleParticipantJoined(eventId: number, userId: string): Promise<void> {
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

      // Check if event is in the future
      const eventDateTime = new Date(`${event.date} ${event.time}`);
      const now = new Date();
      
      if (eventDateTime <= now) {
        console.log('Event is in the past, not scheduling reminders');
        return;
      }

      // Get user preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError || !preferences) {
        console.error('Failed to get user preferences:', preferencesError);
        return;
      }

      // Schedule reminders for the new participant
      const templateData = {
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        location: event.location,
        sport: event.sport,
      };

      // Calculate reminder times
      const reminderTime24h = new Date(eventDateTime.getTime() - 24 * 60 * 60 * 1000);
      const reminderTime2h = new Date(eventDateTime.getTime() - 2 * 60 * 60 * 1000);

      // Schedule 24-hour reminder
      if (preferences.sms_reminders && preferences.reminder_24h && reminderTime24h > now) {
        await notificationManager.notificationService.sendNotification({
          userId,
          eventId,
          type: 'reminder_24h',
          channel: 'sms',
          templateData,
          scheduledFor: reminderTime24h,
        });
      }

      // Schedule 2-hour reminder
      if (preferences.sms_reminders && preferences.reminder_2h && reminderTime2h > now) {
        await notificationManager.notificationService.sendNotification({
          userId,
          eventId,
          type: 'reminder_2h',
          channel: 'sms',
          templateData,
          scheduledFor: reminderTime2h,
        });
      }

      console.log(`Reminders scheduled for participant ${userId} in event ${eventId}`);
    } catch (error) {
      console.error('Failed to handle participant joined:', error);
    }
  }

  // Handle participant leaving event
  async handleParticipantLeft(eventId: number, userId: string): Promise<void> {
    try {
      // Cancel pending reminders for this participant
      await supabase
        .from('notifications_log')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .in('type', ['reminder_24h', 'reminder_2h']);

      console.log(`Reminders cancelled for participant ${userId} in event ${eventId}`);
    } catch (error) {
      console.error('Failed to handle participant left:', error);
    }
  }

  // Handle event update
  async handleEventUpdated(
    eventId: number,
    updateType: 'location' | 'time' | 'cancelled',
    oldValue?: string,
    newValue?: string
  ): Promise<void> {
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

      // Send update notifications to all participants
      await notificationManager.sendEventUpdate(eventId, updateType, newValue);

      // If time changed, reschedule reminders
      if (updateType === 'time' && newValue) {
        const newEventDateTime = new Date(`${event.date} ${newValue}`);
        await notificationManager.scheduler.rescheduleEventNotifications(eventId, newEventDateTime);
      }

      // If cancelled, cancel all reminders
      if (updateType === 'cancelled') {
        await notificationManager.scheduler.cancelEventNotifications(eventId);
      }

      console.log(`Event update handled for event ${eventId}, type: ${updateType}`);
    } catch (error) {
      console.error('Failed to handle event update:', error);
    }
  }

  // Handle event cancellation
  async handleEventCancelled(eventId: number): Promise<void> {
    try {
      await this.handleEventUpdated(eventId, 'cancelled');
    } catch (error) {
      console.error('Failed to handle event cancellation:', error);
    }
  }

  // Bulk schedule reminders for existing events (migration/repair)
  async bulkScheduleReminders(eventIds?: number[]): Promise<void> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gte('date', new Date().toISOString().split('T')[0]);

      if (eventIds) {
        query = query.in('id', eventIds);
      }

      const { data: events, error: eventsError } = await query;

      if (eventsError) {
        console.error('Failed to get events:', eventsError);
        return;
      }

      if (!events || events.length === 0) {
        console.log('No events found to schedule reminders');
        return;
      }

      // Process events in batches
      const batchSize = 10;
      for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize);
        
        await Promise.allSettled(
          batch.map(event => this.handleEventCreated(event))
        );
        
        // Add delay between batches
        if (i + batchSize < events.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`Bulk scheduled reminders for ${events.length} events`);
    } catch (error) {
      console.error('Failed to bulk schedule reminders:', error);
    }
  }

  // Cleanup old notifications
  async cleanupOldNotifications(): Promise<void> {
    try {
      await notificationManager.scheduler.cleanupOldNotifications();
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
    }
  }
}

// Export singleton instance
export const eventNotificationIntegration = EventNotificationIntegration.getInstance();

// Helper functions to be used in event handlers
export const scheduleEventReminders = (event: Event) => 
  eventNotificationIntegration.handleEventCreated(event);

export const scheduleParticipantReminders = (eventId: number, userId: string) => 
  eventNotificationIntegration.handleParticipantJoined(eventId, userId);

export const cancelParticipantReminders = (eventId: number, userId: string) => 
  eventNotificationIntegration.handleParticipantLeft(eventId, userId);

export const sendEventUpdateNotification = (
  eventId: number,
  updateType: 'location' | 'time' | 'cancelled',
  oldValue?: string,
  newValue?: string
) => eventNotificationIntegration.handleEventUpdated(eventId, updateType, oldValue, newValue);

export const cancelEventNotifications = (eventId: number) => 
  eventNotificationIntegration.handleEventCancelled(eventId);