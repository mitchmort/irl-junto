"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapPin, Users, Share2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { parseLocationData } from "@/lib/location-utils";
import { useDashboardData } from "@/hooks/use-dashboard-data";

function useCountdown(targetDate: string, targetTime: string) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateCountdown = () => {
      const gameTime = new Date(`${targetDate}T${targetTime}`);
      const now = new Date();
      const difference = gameTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeString = "";
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        timeString += `${minutes}m`;
        
        setTimeLeft(timeString);
      } else {
        setTimeLeft("Game in progress");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return timeLeft;
}

export const NextGameHero = React.memo(function NextGameHero() {
  const { data: dashboardData, isLoading: loading } = useDashboardData();
  const router = useRouter();
  
  const nextGame = dashboardData?.nextGame;
  const participants = dashboardData?.nextGameParticipants || [];
  
  const timeLeft = useCountdown(nextGame?.date || "", nextGame?.time || "");
  
  const locationDisplay = useMemo(() => {
    if (!nextGame?.location) return null;
    return parseLocationData(nextGame.location);
  }, [nextGame?.location]);

  const handleShare = async () => {
    if (!nextGame) return;
    
    const shareData = {
      title: `Join ${nextGame.title}!`,
      text: `Join us for ${nextGame.sport} on ${nextGame.date} at ${nextGame.time}`,
      url: `${window.location.origin}/event/${nextGame.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(shareData.url);
    }
  };

  const handleViewEvent = () => {
    if (nextGame) {
      router.push(`/dashboard/events/${nextGame.id}`);
    }
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Next Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nextGame) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Next Game
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">No upcoming games scheduled</p>
          <Button onClick={() => router.push('/dashboard/events/create')}>
            Create a Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Next Game
          </div>
          <Badge variant="secondary" className="font-mono">
            {timeLeft}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">{nextGame.title}</h3>
          <p className="text-sm text-muted-foreground">
            {nextGame.sport} • {nextGame.date} at {nextGame.time}
          </p>
        </div>

        {locationDisplay && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{locationDisplay}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {participants.length} / {nextGame.max_participants || '∞'} players
          </span>
        </div>

        {participants.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {participants.slice(0, 5).map((participant, index) => (
                <Avatar key={participant.profiles?.id || index} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={participant.profiles?.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {participant.profiles?.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {participants.length > 5 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{participants.length - 5}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button onClick={handleViewEvent} className="flex-1">
            View Details
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});