"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEvent } from "@/hooks/use-events";
import { useEventPermissions } from "@/hooks/use-event-permissions";
import { useEventEditStore } from "@/store/event-edit";
import { EventPage } from "@/components/event-detail/event-page";
import { EditControls } from "./edit-controls";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventEditPageProps {
  eventId: number;
}

export function EventEditPage({ eventId }: EventEditPageProps) {
  const router = useRouter();
  const { event, loading: eventLoading, error: eventError } = useEvent(eventId);
  const { permissions, loading: permissionsLoading } = useEventPermissions(eventId);
  const { setOriginalEvent, hasChanges, resetForm } = useEventEditStore();
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const isLoading = eventLoading || permissionsLoading;

  // Set original event data when loaded
  useEffect(() => {
    if (event) {
      setOriginalEvent(event);
    }
  }, [event, setOriginalEvent]);

  // Check permissions
  useEffect(() => {
    if (!isLoading && permissions) {
      if (!permissions.canEditEvent) {
        router.push(`/dashboard/events/${eventId}`);
        return;
      }
    }
  }, [permissions, isLoading, router, eventId]);

  // Handle navigation with unsaved changes warning
  const handleBack = () => {
    if (hasChanges()) {
      setShowUnsavedWarning(true);
    } else {
      router.push(`/dashboard/events/${eventId}`);
    }
  };

  const handleDiscardChanges = () => {
    resetForm();
    router.push(`/dashboard/events/${eventId}`);
  };

  // Error state
  if (eventError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold text-red-600">Event Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The event you're trying to edit doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => router.push("/dashboard/events")} 
            className="mt-4"
            variant="outline"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !event || !permissions) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </div>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event
          </Button>
          <div className="text-sm text-muted-foreground">
            Edit Event
          </div>
        </div>
        
        <EditControls eventId={eventId} />
      </div>

      {/* Unsaved changes warning */}
      {showUnsavedWarning && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You have unsaved changes. Are you sure you want to leave?
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUnsavedWarning(false)}
              >
                Continue Editing
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDiscardChanges}
              >
                Discard Changes
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Edit mode indicator */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          You're in edit mode. Click on any field to edit it, then save your changes.
        </AlertDescription>
      </Alert>

      {/* Event page in edit mode */}
      <EventPage eventId={eventId} editMode={true} />
    </div>
  );
}