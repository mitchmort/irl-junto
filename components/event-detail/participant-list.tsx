"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Eye, EyeOff } from "lucide-react";
import { EventPermissions } from "@/hooks/use-event-permissions";

interface Participant {
  id: number;
  status: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url?: string | null;
    username?: string | null;
  } | null;
}

interface ParticipantListProps {
  participants: Participant[];
  maxParticipants: number;
  permissions: EventPermissions;
  organizerId?: string | null;
}

export function ParticipantList({ 
  participants, 
  maxParticipants, 
  permissions,
  organizerId 
}: ParticipantListProps) {
  const confirmedParticipants = participants.filter(p => p.status === 'confirmed');
  const pendingParticipants = participants.filter(p => p.status === 'pending');
  const emptySpots = Math.max(0, maxParticipants - confirmedParticipants.length);

  // Determine what to show based on permissions
  const showFullList = permissions.canSeeAllParticipants;
  const showCount = permissions.isAuthenticated || permissions.isGuest;

  const getInitials = (participant: Participant) => {
    const name = participant.profiles?.full_name || participant.profiles?.username || 'Unknown';
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const getDisplayName = (participant: Participant) => {
    return participant.profiles?.full_name || participant.profiles?.username || 'Unknown User';
  };

  const getParticipantRole = (participantId: string) => {
    if (organizerId && participantId === organizerId) return 'Organizer';
    return 'Player';
  };

  if (!showCount) {
    return (
      <div className="text-center py-8">
        <EyeOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-muted-foreground">
          Sign in to view participant information
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Confirmed Participants */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            Who&apos;s Coming ({confirmedParticipants.length}/{maxParticipants})
          </h3>
          {permissions.spotsAvailable > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {permissions.spotsAvailable} spot{permissions.spotsAvailable === 1 ? '' : 's'} left
            </Badge>
          )}
        </div>

        {showFullList ? (
          // Full participant list for authorized users
          <div className="space-y-2">
            {confirmedParticipants.map((participant) => (
              <div 
                key={participant.id} 
                className="flex items-center gap-3 p-2 rounded-lg border bg-card"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={participant.profiles?.avatar_url || undefined} />
                  <AvatarFallback>
                    {getInitials(participant)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{getDisplayName(participant)}</div>
                  <div className="text-sm text-muted-foreground">
                    {getParticipantRole(participant.user_id)}
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Confirmed
                </Badge>
              </div>
            ))}
            
            {/* Empty spots */}
            {Array(emptySpots).fill(0).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 p-2 rounded-lg border border-dashed bg-muted/30">
                <div className="w-10 h-10 rounded-full border border-dashed bg-muted/50 flex items-center justify-center">
                  <span className="text-xs opacity-60">+</span>
                </div>
                <div className="flex-1 text-muted-foreground">
                  Open spot
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Limited view for non-participants
          <div className="flex flex-wrap gap-2">
            {confirmedParticipants.slice(0, 6).map((participant) => (
              <div 
                key={participant.id} 
                className="group relative flex w-12 h-12 cursor-pointer items-center justify-center rounded-full border bg-muted hover:bg-muted/80"
                title={showFullList ? getDisplayName(participant) : 'Participant'}
              >
                <Avatar className="w-full h-full">
                  <AvatarImage src={participant.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(participant)}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
            
            {/* Show "+X more" if there are hidden participants */}
            {confirmedParticipants.length > 6 && (
              <div className="flex w-12 h-12 items-center justify-center rounded-full border bg-muted">
                <span className="text-xs font-medium">
                  +{confirmedParticipants.length - 6}
                </span>
              </div>
            )}
            
            {/* Empty spots */}
            {Array(Math.min(emptySpots, 3)).fill(0).map((_, i) => (
              <div key={`empty-${i}`} className="flex w-12 h-12 items-center justify-center rounded-full border border-dashed bg-muted/50">
                <span className="text-xs opacity-60">+</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Participants (only visible to organizer) */}
      {permissions.canManageParticipants && pendingParticipants.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold text-sm text-muted-foreground">
            Pending Requests ({pendingParticipants.length})
          </h3>
          <div className="space-y-1">
            {pendingParticipants.map((participant) => (
              <div 
                key={participant.id} 
                className="flex items-center gap-3 p-2 rounded-lg border bg-yellow-50 border-yellow-200"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(participant)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-sm">{getDisplayName(participant)}</div>
                </div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  Pending
                </Badge>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-7 px-2">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Join prompt for guests */}
      {permissions.isGuest && (
        <div className="text-center py-4 border rounded-lg bg-muted/30">
          <Eye className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Sign up to see who&apos;s playing and join the game
          </p>
          <Button size="sm" variant="outline">
            Sign Up to Join
          </Button>
        </div>
      )}
    </div>
  );
}