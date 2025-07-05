"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";

export interface UserActivity {
  id: number;
  title: string;
  sport: string;
  date: string;
  time: string;
  location: string;
  participant_count: number;
  role: string;
  status: string;
  event_created: string;
}

export function useUserActivity() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserActivity() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: queryError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            sport,
            date,
            time,
            location,
            participant_count,
            created_at,
            event_participants!inner (
              role,
              status
            )
          `)
          .eq('event_participants.user_id', user.id)
          .eq('status', 'completed')
          .order('date', { ascending: false })
          .limit(10);

        if (queryError) {
          throw queryError;
        }

        // Transform the data to match our interface
        const transformedActivities: UserActivity[] = data?.map(event => ({
          id: event.id,
          title: event.title,
          sport: event.sport,
          date: event.date,
          time: event.time,
          location: event.location,
          participant_count: event.participant_count,
          role: event.event_participants[0]?.role || 'participant',
          status: event.event_participants[0]?.status || 'attended',
          event_created: event.created_at || new Date().toISOString()
        })) || [];

        setActivities(transformedActivities);
      } catch (err) {
        console.error('Error fetching user activity:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch activity');
      } finally {
        setLoading(false);
      }
    }

    fetchUserActivity();
  }, [user?.id, supabase]);

  return {
    activities,
    loading,
    error,
    refetch: () => {
      if (user?.id) {
        setLoading(true);
        // Re-trigger the effect by updating a dependency
      }
    }
  };
} 