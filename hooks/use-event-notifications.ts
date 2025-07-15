import { useState, useCallback } from 'react';
import { Event, EventParticipant } from '@/types/database';
import { notificationManager } from '@/lib/notifications';

export interface EventNotificationResult {
  success: boolean;
  error?: string;
  processed?: number;
  failed?: number;
}

export function useEventNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Schedule reminders when event is created
  const scheduleEventReminders = useCallback(async (eventId: number, organizerId: string): Promise<EventNotificationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/schedule-reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          organizerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule reminders');
      }

      const data = await response.json();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule reminders';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reschedule reminders when event time changes
  const rescheduleEventReminders = useCallback(async (
    eventId: number,
    newDateTime: string,
    organizerId: string
  ): Promise<EventNotificationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/schedule-reminders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          newDateTime,
          organizerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reschedule reminders');
      }

      const data = await response.json();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reschedule reminders';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel reminders when event is cancelled
  const cancelEventReminders = useCallback(async (eventId: number, organizerId: string): Promise<EventNotificationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications/schedule-reminders?eventId=${eventId}&organizerId=${organizerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel reminders');
      }

      const data = await response.json();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel reminders';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Send event update notification
  const sendEventUpdate = useCallback(async (
    eventId: number,
    updateType: 'location' | 'time' | 'cancelled',
    newValue?: string
  ): Promise<EventNotificationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          type: 'event_update',
          templateData: {
            updateType,
            newValue,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send event update');
      }

      const data = await response.json();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send event update';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Send organizer message
  const sendOrganizerMessage = useCallback(async (
    eventId: number,
    senderId: string,
    message: string
  ): Promise<EventNotificationResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/event-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          senderId,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      return { 
        success: true, 
        processed: data.summary.successful,
        failed: data.summary.failed 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get event messages
  const getEventMessages = useCallback(async (eventId: number, limit = 50, offset = 0) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications/event-message?eventId=${eventId}&limit=${limit}&offset=${offset}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get messages');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get messages';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    scheduleEventReminders,
    rescheduleEventReminders,
    cancelEventReminders,
    sendEventUpdate,
    sendOrganizerMessage,
    getEventMessages,
  };
}