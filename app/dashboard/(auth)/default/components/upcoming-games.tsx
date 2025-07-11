"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Event, EventParticipant } from "@/types/database";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseLocationData } from "@/lib/location-utils";

interface GameWithParticipation extends Event {
  userParticipation?: EventParticipant;
}

export function UpcomingGames() {
  const [games, setGames] = useState<GameWithParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUpcomingGames();
  }, []);

  const fetchUpcomingGames = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(now.getDate() + 14);

      // Fetch upcoming games
      const { data: upcomingGames, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', now.toISOString().split('T')[0])
        .lte('date', twoWeeksFromNow.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(7);

      if (error) {
        console.error('Error fetching upcoming games:', error);
        setLoading(false);
        return;
      }

      if (!upcomingGames) {
        setLoading(false);
        return;
      }

      // Check user participation for each game
      const gameIds = upcomingGames.map(g => g.id);
      const { data: participations } = await supabase
        .from('event_participants')
        .select('*')
        .in('event_id', gameIds)
        .eq('user_id', user.id);

      // Merge participation data with games
      const gamesWithParticipation = upcomingGames.map(game => {
        const participation = participations?.find(p => p.event_id === game.id);
        return { ...game, userParticipation: participation };
      });

      setGames(gamesWithParticipation);
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (gameId: number, action: 'join' | 'leave') => {
    setUpdating(gameId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (action === 'join') {
        const { error } = await supabase.rpc('join_event', { 
          event_id_to_join: gameId 
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('leave_event', { 
          event_id_to_leave: gameId 
        });
        if (error) throw error;
      }

      // Refresh the games list
      await fetchUpcomingGames();
    } catch (error) {
      console.error('Error updating RSVP:', error);
    } finally {
      setUpdating(null);
    }
  };

  const formatGameTime = (date: string, time: string) => {
    const gameDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diffDays = Math.floor((gameDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return gameDate.toLocaleDateString('en-US', { weekday: 'long' });
    return gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSpotsLeft = (game: Event) => {
    const spotsLeft = game.max_participants - game.participant_count;
    if (spotsLeft === 0) return { text: "Full", color: "destructive" };
    if (spotsLeft === 1) return { text: "1 spot left", color: "warning" };
    if (spotsLeft <= 3) return { text: `${spotsLeft} spots left`, color: "warning" };
    return { text: `${spotsLeft} spots`, color: "secondary" };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Games</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Upcoming Games
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/dashboard/apps/calendar')}
          >
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {games.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No upcoming games in the next two weeks
              </p>
            ) : (
              games.map((game) => {
                const spots = getSpotsLeft(game);
                const isJoined = game.userParticipation?.status === 'confirmed';
                const gameTime = new Date(`${game.date}T${game.time}`);
                
                return (
                  <div 
                    key={game.id} 
                    className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{game.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {game.sport} {game.sub_type && `• ${game.sub_type}`}
                          </p>
                        </div>
                        <Badge variant={spots.color as any} className="ml-2">
                          {spots.text}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>{formatGameTime(game.date, game.time)}</span>
                          <span>at {gameTime.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{parseLocationData(game.location)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>{game.participant_count} / {game.max_participants} players</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isJoined ? (
                          <>
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              You&apos;re in
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRSVP(game.id, 'leave')}
                              disabled={updating === game.id}
                            >
                              Cancel RSVP
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleRSVP(game.id, 'join')}
                            disabled={updating === game.id || game.participant_count >= game.max_participants}
                          >
                            {game.participant_count >= game.max_participants ? 'Game Full' : 'Join Game'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/events/${game.url_slug}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}