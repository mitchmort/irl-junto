"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/database";
import { UserActivity } from "./use-user-activity";
import { UserEvent } from "./use-user-events";

export interface ProfileData {
  profile: Profile | null;
  activities: UserActivity[];
  events: UserEvent[];
  stats: {
    totalSports: number;
    totalEvents: number;
    organizedEvents: number;
    recentActivities: number;
  };
}

async function fetchProfileData(userId: string): Promise<ProfileData> {
  if (!userId) {
    throw new Error('No user ID provided');
  }

  try {
    // Parallel queries for better performance
    const [profileResult, activitiesResult, eventsResult] = await Promise.all([
      // Profile data
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),

      // Recent activities (past events user participated in)
      supabase
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
        .eq('event_participants.user_id', userId)
        .lt('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(5),

      // User events (all events user is involved in)
      supabase
        .from('events')
        .select(`
          *,
          event_participants(
            user_id,
            status,
            role,
            created_at
          )
        `)
        .order('date', { ascending: true })
    ]);

    const profile = profileResult.data;
    const rawActivities = activitiesResult.data || [];
    const rawEvents = eventsResult.data || [];

    // Transform activities data
    const activities: UserActivity[] = rawActivities.map(event => ({
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
    }));

    // Transform events data with user role information
    const events: UserEvent[] = rawEvents.map(event => {
      const userParticipation = event.event_participants?.find(p => p.user_id === userId);
      const isOrganizer = event.organizer === userId;
      
      let user_role: 'organizer' | 'participant' | null = null;
      let participant_status: 'attending' | 'pending' | 'declined' | undefined = undefined;

      if (isOrganizer) {
        user_role = 'organizer';
      } else if (userParticipation) {
        user_role = 'participant';
        participant_status = userParticipation.status as 'attending' | 'pending' | 'declined';
      }

      return {
        ...event,
        user_role,
        participant_status,
        participant_count: event.event_participants?.length || 0
      };
    });

    // Calculate stats
    const totalSports = profile?.sports?.length || 0;
    const totalEvents = events.filter(event => event.user_role !== null).length;
    const organizedEvents = events.filter(event => event.user_role === 'organizer').length;
    const recentActivities = activities.length;

    return {
      profile,
      activities,
      events,
      stats: {
        totalSports,
        totalEvents,
        organizedEvents,
        recentActivities
      }
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
}

export function useProfileData(userId?: string) {
  return useQuery({
    queryKey: ['profile-data', userId],
    queryFn: () => fetchProfileData(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 2;
    }
  });
}