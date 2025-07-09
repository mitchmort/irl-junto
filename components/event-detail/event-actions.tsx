"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { 
  Users, 
  Share2, 
  Edit3Icon, 
  Trash2Icon, 
  LogIn,
  UserCheck,
  UserX,
  Clock
} from "lucide-react";
import { EventPermissions } from "@/hooks/use-event-permissions";
import { useEventParticipants } from "@/hooks/use-event-participants";

interface EventActionsProps {
  eventId?: number;
  permissions: EventPermissions;
  onPermissionsChange?: () => void;
}

export function EventActions({ eventId, permissions, onPermissionsChange }: EventActionsProps) {
  const router = useRouter();
  const { joinEvent, leaveEvent } = useEventParticipants(eventId);
  const [isLoading, setIsLoading] = useState(false);
  
  // Return null if eventId is not available
  if (!eventId) {
    return null;
  }

  const handleJoinEvent = async () => {
    setIsLoading(true);
    try {
      const result = await joinEvent();
      if (result) {
        toast({
          title: "Joined Event!",
          description: "You've successfully joined the event. You'll receive updates about the game.",
        });
        onPermissionsChange?.();
      } else {
        throw new Error('Failed to join event');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveEvent = async () => {
    setIsLoading(true);
    try {
      const result = await leaveEvent();
      if (result) {
        toast({
          title: "Left Event",
          description: "You've left the event. You can rejoin anytime if spots are available.",
        });
        onPermissionsChange?.();
      } else {
        throw new Error('Failed to leave event');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareEvent = async () => {
    const shareUrl = `${window.location.origin}/event/${eventId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my sports event!',
          text: 'Come play with us!',
          url: shareUrl
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Event link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link. Please copy manually.",
          variant: "destructive"
        });
      }
    }
  };

  const handleLogin = () => {
    router.push('/dashboard/login');
  };

  const handleEditEvent = () => {
    router.push(`/dashboard/events/${eventId}/edit`);
  };

  const handleDeleteEvent = async () => {
    // TODO: Implement delete functionality
    toast({
      title: "Delete Event",
      description: "Delete functionality will be implemented soon.",
    });
  };

  const getPrimaryButton = () => {
    const { primaryButtonAction, primaryButtonText, primaryButtonDisabled, primaryButtonVariant } = permissions;

    const buttonProps = {
      disabled: primaryButtonDisabled || isLoading,
      variant: primaryButtonVariant,
      className: "flex-1 h-12"
    };

    switch (primaryButtonAction) {
      case 'login':
        return (
          <Button {...buttonProps} onClick={handleLogin}>
            <LogIn className="w-4 h-4 mr-2" />
            {primaryButtonText}
          </Button>
        );
      
      case 'join':
        return (
          <Button {...buttonProps} onClick={handleJoinEvent}>
            <Users className="w-4 h-4 mr-2" />
            {primaryButtonText}
          </Button>
        );
      
      case 'leave':
        return (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button {...buttonProps}>
                <UserX className="w-4 h-4 mr-2" />
                {primaryButtonText}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave Event</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave this event? You can rejoin later if spots are still available.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLeaveEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Leave Event
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      
      case 'cancel_request':
        return (
          <Button {...buttonProps} onClick={handleLeaveEvent}>
            <Clock className="w-4 h-4 mr-2" />
            {primaryButtonText}
          </Button>
        );
      
      case 'edit':
        return (
          <Button {...buttonProps} onClick={handleEditEvent}>
            <Edit3Icon className="w-4 h-4 mr-2" />
            {primaryButtonText}
          </Button>
        );
      
      case 'none':
      default:
        return (
          <Button {...buttonProps}>
            {primaryButtonText}
          </Button>
        );
    }
  };

  const getSecondaryButtons = () => {
    const buttons = [];

    // Share button (always available)
    if (permissions.canShareEvent) {
      buttons.push(
        <Button key="share" variant="outline" onClick={handleShareEvent} className="h-12">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      );
    }

    // Organizer-specific buttons
    if (permissions.isOrganizer && permissions.primaryButtonAction !== 'edit') {
      buttons.push(
        <Button key="edit" variant="outline" onClick={handleEditEvent} className="h-12">
          <Edit3Icon className="w-4 h-4" />
        </Button>
      );
    }

    if (permissions.canDeleteEvent) {
      buttons.push(
        <AlertDialog key="delete">
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" className="h-12 w-12">
              <Trash2Icon className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this event? This action cannot be undone and all participants will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Event
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-4">
      {/* Status Messages */}
      {permissions.statusMessage && (
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-green-600" />
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {permissions.statusMessage}
          </Badge>
        </div>
      )}
      
      {permissions.urgencyMessage && (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600" />
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {permissions.urgencyMessage}
          </Badge>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {getPrimaryButton()}
        {getSecondaryButtons()}
      </div>
    </div>
  );
}