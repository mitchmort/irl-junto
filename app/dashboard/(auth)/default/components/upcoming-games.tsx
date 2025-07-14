"use client";

import React from "react";
import { Calendar, MapPin, Users, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/database";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseLocationData } from "@/lib/location-utils";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const GameCard = React.memo(({ game }: { game: Event }) => {
  const router = useRouter();
  const locationDisplay = parseLocationData(game.location || '');

  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">{game.title}</h4>
          <Badge variant="outline">{game.sport}</Badge>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{game.date} at {game.time}</span>
          </div>
          {locationDisplay && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[150px]">
                {locationDisplay}
              </span>
            </div>
          )}
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => router.push(`/dashboard/events/${game.id}`)}
      >
        View
      </Button>
    </div>
  );
});

GameCard.displayName = "GameCard";

const SkeletonGameCard = React.memo(() => (
  <div className="flex items-center space-x-4 rounded-lg border p-4">
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    <Skeleton className="h-8 w-16" />
  </div>
));

SkeletonGameCard.displayName = "SkeletonGameCard";

export const UpcomingGames = React.memo(function UpcomingGames() {
  const { data: dashboardData, isLoading: loading } = useDashboardData();
  const router = useRouter();
  
  const upcomingGames = dashboardData?.upcomingGames || [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonGameCard key={i} />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  if (upcomingGames.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Games
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">No upcoming games found</p>
          <Button onClick={() => router.push('/dashboard/events')}>
            Browse Games
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Games
          </div>
          <Badge variant="secondary">{upcomingGames.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {upcomingGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </ScrollArea>
        {upcomingGames.length >= 7 && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/dashboard/events')}
            >
              View All Games
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});