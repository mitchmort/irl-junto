"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  Share2, 
  Eye, 
  Plus, 
  Copy,
  Calendar,
  MapPin,
  Users,
  Clock 
} from "lucide-react";
import { format } from "date-fns";

interface SuccessScreenProps {
  eventData: {
    id: string;
    sport: string;
    format: string;
    date: Date;
    startTime: string;
    location: { name: string };
    totalPlayers: number;
    playersConfirmed: number;
    cost: number;
  };
}

export function SuccessScreen({ eventData }: SuccessScreenProps) {
  const router = useRouter();

  // Generate shareable link
  const shareLink = `https://junto.app/event/${eventData.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "Link copied!",
        description: "Event link has been copied to your clipboard.",
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link copied!",
        description: "Event link has been copied to your clipboard.",
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${eventData.sport} ${eventData.format}`,
      text: `Join my ${eventData.sport} game on ${format(eventData.date, 'MMM d')}!`,
      url: shareLink
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled sharing
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  const handleViewEvent = () => {
    router.push(`/dashboard/events/${eventData.id}`);
  };

  const handleCreateAnother = () => {
    router.push('/dashboard/events/create?step=1');
  };

  const handleBackToEvents = () => {
    router.push('/dashboard/events');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const playersNeeded = eventData.totalPlayers - eventData.playersConfirmed;

  return (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
          Event Created!
        </h1>
        <p className="text-muted-foreground">
          Your event is ready to share with players
        </p>
      </div>

      {/* Event Summary Card */}
      <Card className="p-6 text-left">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">
              {eventData.sport} {eventData.format}
            </h2>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(eventData.date, 'EEEE, MMMM d')}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{formatTime(eventData.startTime)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{eventData.location.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  {playersNeeded > 0 
                    ? `Need ${playersNeeded} more player${playersNeeded === 1 ? '' : 's'}`
                    : 'Event full'
                  }
                </span>
                <span className="text-xs">•</span>
                <span>
                  {eventData.cost === 0 ? 'Free' : `$${eventData.cost} each`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Share Link Card */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Event Link</span>
            <Badge variant="secondary" className="text-xs">
              Share this
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="flex-1 text-sm truncate">
              {shareLink}
            </code>
            <Button size="sm" variant="outline" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full h-14 text-lg" 
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share Event
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full h-12" 
          onClick={handleViewEvent}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Event Page
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full h-12" 
          onClick={handleCreateAnother}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Another Event
        </Button>
      </div>

      {/* Back to Events Link */}
      <Button 
        variant="ghost" 
        className="w-full text-muted-foreground" 
        onClick={handleBackToEvents}
      >
        Back to My Events
      </Button>
    </div>
  );
}