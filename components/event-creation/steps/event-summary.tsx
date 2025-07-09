"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEventCreationStore } from "@/store/event-creation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  Trophy,
  Star,
  FileText,
  Navigation,
  Edit3,
  Save,
  X,
  RotateCcw,
  Globe,
  Lock
} from "lucide-react";
import { format } from "date-fns";
import { useEvents } from "@/hooks/use-events";
import { useAuth } from "@/components/auth/auth-provider";
import { transformFormDataToSupabase, validateEventFormData, generateShareLink, generateEnhancedEventTitle } from "@/lib/event-creation-utils";
import { supabase } from "@/lib/supabase";

export function EventSummaryStep() {
  const router = useRouter();
  const { createEvent } = useEvents();
  const { user, loading: authLoading } = useAuth();
  const { 
    formData, 
    setSubmitting, 
    isSubmitting,
    resetForm,
    setCreatedEventId,
    setCreatedEventSlug,
    setShowSuccessScreen,
    updateField
  } = useEventCreationStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const getSportDisplayName = () => {
    const sportNames = {
      basketball: 'Basketball',
      tennis: 'Tennis', 
      pickleball: 'Pickleball',
      volleyball: 'Volleyball',
      soccer: 'Soccer',
      climbing: 'Rock Climbing'
    };
    return sportNames[formData.sport as keyof typeof sportNames] || 'Event';
  };

  const getFormatDisplay = () => {
    return formData.isCustomFormat ? formData.customFormatText : formData.format;
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  const getSkillLevelDisplay = () => {
    const skillLevels = {
      beginner: 'Beginner',
      casual: 'Casual',
      intermediate: 'Intermediate', 
      advanced: 'Advanced',
      all: 'All Welcome'
    };
    return skillLevels[formData.skillLevel as keyof typeof skillLevels] || formData.skillLevel;
  };

  const playersNeeded = formData.totalPlayers - formData.playersConfirmed;

  // Generate or get the current title
  const getCurrentTitle = () => {
    if (formData.isCustomTitle && formData.title) {
      return formData.title;
    }
    return generateEnhancedEventTitle(formData);
  };

  // Handle title editing
  const handleEditTitle = () => {
    setEditedTitle(getCurrentTitle());
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      updateField('title', editedTitle.trim());
      updateField('isCustomTitle', true);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setEditedTitle('');
    setIsEditingTitle(false);
  };

  const handleResetToAutoTitle = () => {
    updateField('title', undefined);
    updateField('isCustomTitle', false);
    setEditedTitle('');
    setIsEditingTitle(false);
  };

  const submitEvent = async () => {
    // Wait for auth to load before checking authentication
    if (authLoading) {
      return;
    }
    
    // Validate user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create an event.",
        variant: "destructive"
      });
      return;
    }

    // Validate form data
    const validationErrors = validateEventFormData(formData);
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors[0],
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    setSubmitting(true);
    
    try {
      // Transform form data to Supabase format
      console.log('Form data before transformation:', formData);
      const eventData = await transformFormDataToSupabase(formData, user.id);
      console.log('Transformed event data:', eventData);
      
      // Create event in Supabase
      const createdEvent = await createEvent(eventData);
      console.log('Created event:', createdEvent);
      
      if (!createdEvent) {
        throw new Error('Failed to create event');
      }
      
      // Add organizer as first participant
      try {
        await supabase
          .from('event_participants')
          .insert({
            event_id: createdEvent.id,
            user_id: user.id,
            status: 'confirmed',
            role: 'organizer'
          });
      } catch (participantError) {
        console.warn('Failed to add organizer as participant:', participantError);
        // Don't fail the whole operation if participant creation fails
      }
      
      // Set the created event ID and slug, then show success screen
      setCreatedEventId(createdEvent.id.toString());
      setCreatedEventSlug(createdEvent.url_slug);
      setShowSuccessScreen(true);
      
      toast({
        title: "Event Created!",
        description: "Your event has been successfully created and is ready to share.",
      });
      
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setSubmitting(false);
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">
              Creating your event...
            </h1>
            <p className="text-muted-foreground mt-2">
              This will only take a moment
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Validating event details</span>
            </div>
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Creating event page</span>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="h-5 w-5 border-2 border-muted rounded-full" />
              <span className="text-sm text-muted-foreground">Generating share link</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          Review & Create
        </h1>
        <p className="text-muted-foreground">
          Double-check your event details
        </p>
      </div>

      {/* Event Summary Card */}
      <Card className="p-6 space-y-4">
        <div className="space-y-3">
          {/* Event Title Section */}
          <div className="space-y-2">
            {!isEditingTitle ? (
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {getCurrentTitle()}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditTitle}
                    className="h-8 px-2"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Badge variant="outline" className="capitalize">
                    {getSkillLevelDisplay()}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Event title"
                    className="flex-1"
                    maxLength={60}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveTitle}
                    className="h-8 px-2"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditTitle}
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetToAutoTitle}
                    className="h-7 px-2 text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Auto-generate
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {editedTitle.length}/60 characters
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {getSkillLevelDisplay()}
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Show indicator for custom vs auto-generated title */}
            {!isEditingTitle && (
              <div className="text-xs text-muted-foreground">
                {formData.isCustomTitle ? 'Custom title' : 'Auto-generated title'}
              </div>
            )}
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {formData.date && format(formData.date, 'EEEE, MMMM d, yyyy')}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(formData.startTime)}</span>
                  <span>•</span>
                  <span>{formatDuration(formData.duration)}</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{formData.location?.name}</p>
                <p className="text-sm text-muted-foreground">{formData.location?.address}</p>
              </div>
            </div>

            {/* Players */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {formData.playersConfirmed} of {formData.totalPlayers} confirmed
                </p>
                <p className="text-sm text-muted-foreground">
                  {playersNeeded > 0 
                    ? `Need ${playersNeeded} more player${playersNeeded === 1 ? '' : 's'}`
                    : 'Event is full'
                  }
                </p>
              </div>
            </div>

            {/* Cost */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {formData.cost === 0 ? 'Free Event' : `$${formData.cost} per person`}
                </p>
                {formData.cost > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Total: ${formData.cost * formData.totalPlayers} for all players
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Event Description */}
          {formData.description && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                  <Globe className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">About this event</p>
                    <Badge variant="outline" className="text-xs">
                      Public
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
                </div>
              </div>
            </>
          )}

          {/* Additional Details */}
          {formData.additionalDetails && (
            <>
              <Separator />
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">Extra details for confirmed players</p>
                    <Badge variant="outline" className="text-xs">
                      Private
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{formData.additionalDetails}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Create Event Button */}
      <div className="space-y-3">
        <Button 
          className="w-full h-14 text-lg" 
          onClick={submitEvent}
          disabled={isSubmitting || authLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating Event...
            </>
          ) : authLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Create Event
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You can edit these details after creating your event
        </p>
      </div>
    </div>
  );
}