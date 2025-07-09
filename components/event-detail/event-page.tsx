"use client";

import { generateMeta } from "@/lib/utils";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useEvent } from "@/hooks/use-events";
import { useEventParticipants } from "@/hooks/use-event-participants";
import { EventActions } from "./event-actions";
import { ParticipantList } from "./participant-list";
import { EventDetails } from "./event-details";
import EventMapLocation from "@/app/dashboard/(auth)/events/[id]/event-map-location";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar } from "lucide-react";

interface EventPageProps {
  eventId: number;
  editMode?: boolean;
}

export function EventPage({ eventId, editMode = false }: EventPageProps) {
  const { event, loading: eventLoading, error: eventError } = useEvent(eventId);
  const { participants, loading: participantsLoading } = useEventParticipants(eventId);
  const { permissions, loading: permissionsLoading, refreshPermissions } = useEventPermissions(eventId);

  const isLoading = eventLoading || participantsLoading || permissionsLoading;

  // Error state
  if (eventError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold text-red-600">Event Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !event || !permissions) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-1">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="xl:col-span-2">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const getEventStatusBadge = () => {
    const { eventStatus } = permissions;
    
    const statusConfig = {
      open: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Open' },
      full: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Full' },
      completed: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Cancelled' }
    };

    const config = statusConfig[eventStatus] || statusConfig.open;
    
    return (
      <Badge className={`${config.color} font-semibold`}>
        {config.text}
      </Badge>
    );
  };

  const parseLocation = (locationString: string) => {
    try {
      const parsed = JSON.parse(locationString);
      
      // If we have a full address, use it as is for the map
      const fullAddress = parsed.address || '';
      
      // Try to extract components from the address if possible
      const addressParts = fullAddress.split(',').map((part: string) => part.trim());
      const mainAddress = addressParts[0] || '';
      
      // Try to identify city, state, zip from the remaining parts
      let city = '';
      let zip = '';
      
      if (addressParts.length > 1) {
        // Look for zip code pattern in the last parts
        const lastPart = addressParts[addressParts.length - 1];
        const zipMatch = lastPart.match(/\b\d{5}(-\d{4})?\b/);
        
        if (zipMatch) {
          zip = zipMatch[0];
          // Remove zip from the address parts to get city/state
          const remainingParts = addressParts.slice(1, -1);
          if (remainingParts.length > 0) {
            city = remainingParts.join(', ');
          } else {
            // Zip was in the same part as city/state
            city = lastPart.replace(zipMatch[0], '').trim().replace(/,$/, '');
          }
        } else {
          // No zip found, treat remaining as city/state
          city = addressParts.slice(1).join(', ');
        }
      }
      
      return {
        address: mainAddress,
        city: city,
        zip: zip,
        name: parsed.name || 'Event Location',
        fullAddress: fullAddress // Add full address for map component
      };
    } catch {
      return {
        address: locationString,
        city: '',
        zip: '',
        name: 'Location',
        fullAddress: locationString
      };
    }
  };

  const location = parseLocation(event.location);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-xl tracking-tight lg:text-2xl">
              {event.title}
            </h1>
            {getEventStatusBadge()}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            {permissions.isAuthenticated && (
              <div>
                <span className="font-medium text-foreground">Event ID:</span> {event.id.toString().slice(0, 8)}
              </div>
            )}
          </div>
        </div>

        {/* Actions based on permissions */}
        <div className="shrink-0">
          <EventActions 
            eventId={eventId} 
            permissions={permissions}
            onPermissionsChange={refreshPermissions}
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 xl:grid-cols-3">
        {/* Map Location */}
        <div className="xl:col-span-1">
          <EventMapLocation 
            address={location.address}
            city={location.city}
            zip={location.zip}
            venueName={location.name}
            fullAddress={location.fullAddress}
          />
        </div>

        {/* Event Details */}
        <div className="xl:col-span-2">
          <EventDetails event={event} permissions={permissions} editMode={editMode} />
        </div>
      </div>

      {/* Participants Section */}
      <Card>
        <CardContent className="pt-4">
          <ParticipantList 
            participants={participants}
            maxParticipants={event.max_participants}
            permissions={permissions}
            organizerId={event.organizer}
          />
        </CardContent>
      </Card>

      {/* Reviews Section - Only show if user can leave reviews or if there are existing reviews */}
      {(permissions.canLeaveReview || permissions.isAuthenticated) && (
        <Card>
          <CardContent className="pt-4">
            <div className="text-center py-8">
              <h3 className="font-semibold mb-2">Event Reviews</h3>
              <p className="text-muted-foreground text-sm">
                {permissions.canLeaveReview 
                  ? "Share your experience with other players"
                  : "Reviews will be available after the event"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}