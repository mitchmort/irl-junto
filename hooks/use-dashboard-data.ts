"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Event, EventParticipantWithProfile } from "@/types/database";

export interface DashboardData {
  nextGame: Event | null;
  nextGameParticipants: any[]; // Simplified type for now
  upcomingGames: Event[];
  stats: {
    totalGames: number;
    lastWeekGames: number;
    thisWeekGames: number;
    totalOrganized: number;
    trend: 'up' | 'down' | 'neutral';
    percentageChange: number;
  };
}

async function fetchDashboardData(): Promise<DashboardData> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('No authenticated user');
  }

  const now = new Date();
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(now.getDate() + 14);
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  // Parallel queries for better performance
  const [upcomingGamesResult, nextGameResult, statsResult] = await Promise.all([
    // Upcoming games
    supabase
      .from('events')
      .select('*')
      .gte('date', now.toISOString().split('T')[0])
      .lte('date', twoWeeksFromNow.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(7),

    // Next game with participants
    supabase
      .from('events')
      .select(`
        *,
        event_participants!inner(
          status,
          profiles!inner(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .gte('date', now.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(1)
      .single(),

    // Stats queries
    Promise.all([
      // Total games participated
      supabase
        .from('event_participants')
        .select('event_id', { count: 'exact' })
        .eq('user_id', user.id),
      
      // Last week games
      supabase
        .from('event_participants')
        .select('events!inner(date)', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('events.date', oneWeekAgo.toISOString().split('T')[0])
        .lt('events.date', now.toISOString().split('T')[0]),
      
      // This week games
      supabase
        .from('event_participants')
        .select('events!inner(date)', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('events.date', now.toISOString().split('T')[0]),
      
      // Total organized
      supabase
        .from('events')
        .select('id', { count: 'exact' })
        .eq('organizer', user.id)
    ])
  ]);

  const upcomingGames = upcomingGamesResult.data || [];
  const nextGame = nextGameResult.data;
  const nextGameParticipants = nextGame?.event_participants || [];

  // Calculate stats
  const [totalGamesResult, lastWeekResult, thisWeekResult, organizedResult] = statsResult;
  
  const totalGames = totalGamesResult.count || 0;
  const lastWeekGames = lastWeekResult.count || 0;
  const thisWeekGames = thisWeekResult.count || 0;
  const totalOrganized = organizedResult.count || 0;

  // Calculate trend
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  let percentageChange = 0;
  
  if (lastWeekGames > 0) {
    percentageChange = ((thisWeekGames - lastWeekGames) / lastWeekGames) * 100;
    trend = percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral';
  } else if (thisWeekGames > 0) {
    trend = 'up';
    percentageChange = 100;
  }

  return {
    nextGame: nextGame || null,
    nextGameParticipants,
    upcomingGames,
    stats: {
      totalGames,
      lastWeekGames,
      thisWeekGames,
      totalOrganized,
      trend,
      percentageChange: Math.abs(percentageChange)
    }
  };
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
}