"use client";

import { useEffect, useState } from "react";
import { MapPin, Users, Share2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Event, EventParticipantWithProfile } from "@/types/database";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { parseLocationData } from "@/lib/location-utils";

export function NextGameHero() {
  const [nextGame, setNextGame] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventParticipantWithProfile[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNextGame();
  }, []);

  useEffect(() => {
    if (!nextGame) return;

    const updateCountdown = () => {
      const gameTime = new Date(`${nextGame.date}T${nextGame.time}`);
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
  }, [nextGame]);

  const fetchNextGame = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch next game where user is a participant
      const { data: participantData } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', user.id)
        .eq('status', 'confirmed');

      if (!participantData || participantData.length === 0) {
        setLoading(false);
        return;
      }

      const eventIds = participantData.map(p => p.event_id);
      const now = new Date().toISOString().split('T')[0];

      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .gte('date', now)
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching next game:', error);
        setLoading(false);
        return;
      }

      if (!events) {
        setLoading(false);
        return;
      }

      setNextGame(events);

      // Fetch participants for this game
      const { data: gameParticipants } = await supabase
        .from('event_participants')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('event_id', events.id)
        .eq('status', 'confirmed');

      if (gameParticipants) {
        setParticipants(gameParticipants as unknown as EventParticipantWithProfile[]);
      }
    } catch (error) {
      console.error('Error fetching next game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!nextGame?.share_link) return;
    
    try {
      await navigator.clipboard.writeText(nextGame.share_link);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (!nextGame) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Upcoming Games</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You don&apos;t have any games scheduled. Join or create a game to get started!</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/apps/calendar')}>
            Find Games
          </Button>
        </CardContent>
      </Card>
    );
  }

  const gameDate = new Date(`${nextGame.date}T${nextGame.time}`);
  const displayDate = gameDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });
  const displayTime = gameDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Next Game</CardTitle>
        <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
          <Clock className="mr-1 h-4 w-4" />
          {timeLeft}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold">{nextGame.title}</h3>
          <p className="text-muted-foreground">{nextGame.sport} {nextGame.sub_type && `• ${nextGame.sub_type}`}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{displayDate} at {displayTime}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{parseLocationData(nextGame.location)}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{participants.length} / {nextGame.max_participants} players</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {participants.slice(0, 5).map((participant, index) => (
              <Avatar key={participant.id} className="border-2 border-background">
                <AvatarImage 
                  src={participant.profiles?.avatar_url || undefined} 
                  onError={(e) => {
                    // Hide the image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <AvatarFallback>
                  {participant.profiles?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            ))}
            {participants.length > 5 && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                +{participants.length - 5}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => router.push(`/dashboard/events/${nextGame.url_slug}`)}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}