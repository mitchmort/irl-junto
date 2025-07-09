import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useEvent } from '@/hooks/use-events';
import { useEventParticipants } from '@/hooks/use-event-participants';

export interface EventPermissions {
  // User state
  isAuthenticated: boolean;
  isOrganizer: boolean;
  isParticipant: boolean;
  isGuest: boolean;
  participantStatus: 'confirmed' | 'pending' | 'declined' | 'not_participating';
  
  // Event state
  eventStatus: 'open' | 'full' | 'completed' | 'cancelled';
  spotsAvailable: number;
  isEventInPast: boolean;
  
  // Permissions
  canJoinEvent: boolean;
  canLeaveEvent: boolean;
  canEditEvent: boolean;
  canDeleteEvent: boolean;
  canManageParticipants: boolean;
  canSeeAllParticipants: boolean;
  canSeePrivateDetails: boolean;
  canShareEvent: boolean;
  
  // UI State
  primaryButtonText: string;
  primaryButtonAction: 'join' | 'leave' | 'cancel_request' | 'login' | 'edit' | 'none';
  primaryButtonDisabled: boolean;
  primaryButtonVariant: 'default' | 'destructive' | 'outline';
  statusMessage?: string;
  urgencyMessage?: string;
}

export function useEventPermissions(eventId?: number) {
  const { user, loading: authLoading } = useAuth();
  const { event, loading: eventLoading, error: eventError } = useEvent(eventId);
  const { participants, loading: participantsLoading, checkUserParticipation } = useEventParticipants(eventId);
  
  const [userParticipation, setUserParticipation] = useState<any>(null);
  const [permissions, setPermissions] = useState<EventPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  // Check user participation status
  useEffect(() => {
    const checkParticipation = async () => {
      if (!user || !eventId) return;
      
      try {
        const participation = await checkUserParticipation();
        setUserParticipation(participation);
      } catch (error) {
        console.error('Error checking participation:', error);
      }
    };

    if (user && eventId) {
      checkParticipation();
    }
  }, [user, eventId, checkUserParticipation]);

  // Calculate permissions whenever dependencies change
  useEffect(() => {
    if (authLoading || eventLoading || participantsLoading) {
      setLoading(true);
      return;
    }

    if (!event) {
      setLoading(false);
      return;
    }

    const now = new Date();
    const eventDate = new Date(event.date);
    const isEventInPast = eventDate < now;
    const spotsAvailable = event.max_participants - event.participant_count;
    
    // Determine user state
    const isAuthenticated = !!user;
    const isOrganizer = isAuthenticated && user.id === event.organizer;
    const isParticipant = !!userParticipation;
    const isGuest = !isAuthenticated;
    const participantStatus = userParticipation?.status || 'not_participating';
    
    // Determine event status
    let eventStatus: EventPermissions['eventStatus'] = 'open';
    if (isEventInPast) {
      eventStatus = 'completed';
    } else if (spotsAvailable <= 0) {
      eventStatus = 'full';
    } else if (event.status === 'cancelled') {
      eventStatus = 'cancelled';
    }
    
    // Calculate permissions
    const canJoinEvent = isAuthenticated && 
                        !isOrganizer && 
                        !isParticipant && 
                        !isEventInPast && 
                        spotsAvailable > 0 &&
                        eventStatus !== 'cancelled';
                        
    const canLeaveEvent = isParticipant && 
                         (participantStatus === 'confirmed' || participantStatus === 'pending') &&
                         !isEventInPast;
                         
    const canEditEvent = isOrganizer && !isEventInPast;
    const canDeleteEvent = isOrganizer;
    const canManageParticipants = isOrganizer;
    const canSeeAllParticipants = isAuthenticated && (isParticipant || isOrganizer);
    const canSeePrivateDetails = isAuthenticated && (isParticipant || isOrganizer);
    const canShareEvent = true; // Everyone can share
    
    // Determine primary button state
    let primaryButtonText = '';
    let primaryButtonAction: EventPermissions['primaryButtonAction'] = 'none';
    let primaryButtonDisabled = false;
    let primaryButtonVariant: EventPermissions['primaryButtonVariant'] = 'default';
    
    if (isGuest) {
      primaryButtonText = 'Sign up to Join';
      primaryButtonAction = 'login';
    } else if (isOrganizer) {
      primaryButtonText = 'Edit Event';
      primaryButtonAction = 'edit';
      primaryButtonVariant = 'outline';
    } else if (isParticipant) {
      if (participantStatus === 'confirmed') {
        primaryButtonText = 'Leave Event';
        primaryButtonAction = 'leave';
        primaryButtonVariant = 'destructive';
      } else if (participantStatus === 'pending') {
        primaryButtonText = 'Cancel Request';
        primaryButtonAction = 'cancel_request';
        primaryButtonVariant = 'outline';
      }
    } else if (canJoinEvent) {
      primaryButtonText = 'Join Event';
      primaryButtonAction = 'join';
    } else if (eventStatus === 'full') {
      primaryButtonText = 'Event Full';
      primaryButtonAction = 'none';
      primaryButtonDisabled = true;
    } else if (eventStatus === 'completed') {
      primaryButtonText = 'Event Ended';
      primaryButtonAction = 'none';
      primaryButtonDisabled = true;
    } else if (eventStatus === 'cancelled') {
      primaryButtonText = 'Event Cancelled';
      primaryButtonAction = 'none';
      primaryButtonDisabled = true;
    }
    
    // Generate status and urgency messages
    let statusMessage = '';
    let urgencyMessage = '';
    
    if (isParticipant && participantStatus === 'pending') {
      statusMessage = 'Your request to join is pending approval';
    } else if (isParticipant && participantStatus === 'confirmed') {
      statusMessage = "You're attending this event";
    }
    
    if (spotsAvailable <= 2 && spotsAvailable > 0 && !isEventInPast) {
      urgencyMessage = `Only ${spotsAvailable} spot${spotsAvailable === 1 ? '' : 's'} left!`;
    }
    
    const calculatedPermissions: EventPermissions = {
      isAuthenticated,
      isOrganizer,
      isParticipant,
      isGuest,
      participantStatus,
      eventStatus,
      spotsAvailable,
      isEventInPast,
      canJoinEvent,
      canLeaveEvent,
      canEditEvent,
      canDeleteEvent,
      canManageParticipants,
      canSeeAllParticipants,
      canSeePrivateDetails,
      canShareEvent,
      primaryButtonText,
      primaryButtonAction,
      primaryButtonDisabled,
      primaryButtonVariant,
      statusMessage,
      urgencyMessage
    };
    
    setPermissions(calculatedPermissions);
    setLoading(false);
  }, [
    user, 
    event, 
    participants, 
    userParticipation, 
    authLoading, 
    eventLoading, 
    participantsLoading
  ]);

  return {
    permissions,
    loading,
    error: eventError,
    refreshPermissions: () => {
      // Force a re-check of user participation
      if (user && eventId) {
        checkUserParticipation().then(setUserParticipation);
      }
    }
  };
}