import { useState, useCallback, useEffect } from 'react';
import { NotificationPreferences } from '@/types/database';

export interface NotificationPreferencesUpdate {
  sms_reminders?: boolean;
  sms_event_updates?: boolean;
  sms_organizer_messages?: boolean;
  reminder_24h?: boolean;
  reminder_2h?: boolean;
  timezone?: string;
}

export function useNotificationPreferences(userId: string) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications/preferences?userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch preferences');
      }

      const data = await response.json();
      setPreferences(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch preferences';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: NotificationPreferencesUpdate) => {
    if (!userId) return false;

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...updates,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update preferences');
      }

      const data = await response.json();
      setPreferences(data.preferences);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [userId]);

  // Toggle specific preference
  const togglePreference = useCallback(async (key: keyof NotificationPreferencesUpdate) => {
    if (!preferences) return false;

    const currentValue = preferences[key];
    const newValue = !currentValue;

    return updatePreferences({ [key]: newValue });
  }, [preferences, updatePreferences]);

  // Set timezone
  const setTimezone = useCallback(async (timezone: string) => {
    return updatePreferences({ timezone });
  }, [updatePreferences]);

  // Initialize preferences fetch
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    loading,
    updating,
    error,
    fetchPreferences,
    updatePreferences,
    togglePreference,
    setTimezone,
  };
}