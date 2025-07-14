"use client";

import React from "react";
import { TrendingUp, TrendingDown, Calendar, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const StatCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue,
  loading 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  loading: boolean;
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
));

StatCard.displayName = "StatCard";

export const QuickStats = React.memo(function QuickStats() {
  const { data: dashboardData, isLoading: loading } = useDashboardData();
  const stats = dashboardData?.stats || {
    totalGames: 0,
    lastWeekGames: 0,
    thisWeekGames: 0,
    totalOrganized: 0,
    trend: 'neutral' as const,
    percentageChange: 0
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Total Games Played" 
        value={stats.totalGames} 
        icon={Trophy}
        loading={loading}
      />
      <StatCard 
        title="Games Organized" 
        value={stats.totalOrganized} 
        icon={Users}
        loading={loading}
      />
      <StatCard 
        title="This Week" 
        value={stats.thisWeekGames} 
        icon={Calendar}
        trend={stats.trend}
        trendValue={stats.percentageChange}
        loading={loading}
      />
      <StatCard 
        title="Last Week" 
        value={stats.lastWeekGames} 
        icon={Calendar}
        loading={loading}
      />
    </div>
  );
});