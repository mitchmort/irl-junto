"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Calendar, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalGames: number;
  lastWeekGames: number;
  thisWeekGames: number;
  totalOrganized: number;
  trend: 'up' | 'down' | 'neutral';
  percentageChange: number;
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalGames: 0,
    lastWeekGames: 0,
    thisWeekGames: 0,
    totalOrganized: 0,
    trend: 'neutral',
    percentageChange: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get date ranges
      const today = new Date();
      const startOfThisWeek = new Date(today);
      startOfThisWeek.setDate(today.getDate() - today.getDay());
      startOfThisWeek.setHours(0, 0, 0, 0);
      
      const endOfThisWeek = new Date(startOfThisWeek);
      endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
      endOfThisWeek.setHours(23, 59, 59, 999);

      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
      
      const endOfLastWeek = new Date(startOfThisWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
      endOfLastWeek.setHours(23, 59, 59, 999);

      // Fetch all games user participated in
      const { data: allParticipations, error } = await supabase
        .from('event_participants')
        .select('event_id, events!inner(date, organizer)')
        .eq('user_id', user.id)
        .eq('status', 'confirmed');

      if (error) {
        console.error('Error fetching user stats:', error);
        setLoading(false);
        return;
      }

      if (!allParticipations) {
        setLoading(false);
        return;
      }

      // Calculate stats
      const totalGames = allParticipations.length;
      const totalOrganized = allParticipations.filter(p => 
        (p.events as any).organizer === user.id
      ).length;

      const thisWeekGames = allParticipations.filter(p => {
        const eventDate = new Date((p.events as any).date);
        return eventDate >= startOfThisWeek && eventDate <= endOfThisWeek;
      }).length;

      const lastWeekGames = allParticipations.filter(p => {
        const eventDate = new Date((p.events as any).date);
        return eventDate >= startOfLastWeek && eventDate <= endOfLastWeek;
      }).length;

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

      setStats({
        totalGames,
        lastWeekGames,
        thisWeekGames,
        totalOrganized,
        trend,
        percentageChange: Math.abs(percentageChange)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: number;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend && trendValue !== undefined && trend !== 'neutral' && (
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {trendValue.toFixed(0)}%
                </span>
                <span className="ml-1">from last week</span>
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Games Played" 
        value={stats.totalGames} 
        icon={Trophy}
      />
      <StatCard 
        title="Games Organized" 
        value={stats.totalOrganized} 
        icon={Users}
      />
      <StatCard 
        title="This Week" 
        value={stats.thisWeekGames} 
        icon={Calendar}
        trend={stats.trend}
        trendValue={stats.percentageChange}
      />
      <StatCard 
        title="Last Week" 
        value={stats.lastWeekGames} 
        icon={Calendar}
      />
    </div>
  );
}