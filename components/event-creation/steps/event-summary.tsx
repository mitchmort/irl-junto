"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEventCreationStore } from "@/store/event-creation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
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
  Navigation
} from "lucide-react";
import { format } from "date-fns";

export function EventSummaryStep() {
  const router = useRouter();
  const { 
    formData, 
    setSubmitting, 
    isSubmitting,
    resetForm 
  } = useEventCreationStore();
  
  const [isCreating, setIsCreating] = useState(false);

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

  const submitEvent = async () => {
    setIsCreating(true);
    setSubmitting(true);
    
    try {
      // TODO: Replace with actual Supabase submission
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      toast({
        title: "Event Created!",
        description: "Your event has been successfully created and is ready to share.",
      });
      
      // Reset form and redirect
      resetForm();
      router.push('/dashboard/events?created=true');
      
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {getSportDisplayName()} {getFormatDisplay()}
            </h2>
            <Badge variant="outline" className="capitalize">
              {getSkillLevelDisplay()}
            </Badge>
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

          {/* Optional Details */}
          {(formData.equipment || formData.arrivalInstructions) && (
            <>
              <Separator />
              <div className="space-y-3">
                {formData.equipment && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                      <Trophy className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Equipment needed</p>
                      <p className="text-sm text-muted-foreground">{formData.equipment}</p>
                    </div>
                  </div>
                )}

                {formData.arrivalInstructions && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                      <Navigation className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Arrival instructions</p>
                      <p className="text-sm text-muted-foreground">{formData.arrivalInstructions}</p>
                    </div>
                  </div>
                )}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Creating Event...
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