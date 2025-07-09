"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useEventEditStore } from "@/store/event-edit";
import { useEvents } from "@/hooks/use-events";
import { Save, X, RotateCcw, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditControlsProps {
  eventId: number;
}

export function EditControls({ eventId }: EditControlsProps) {
  const router = useRouter();
  const { updateEvent } = useEvents();
  const { 
    editData, 
    hasChanges, 
    resetForm, 
    setIsSaving, 
    isSaving,
    errors,
    clearAllErrors 
  } = useEventEditStore();
  
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleSave = async () => {
    // Clear any existing errors
    clearAllErrors();
    
    // Check if there are any changes
    if (!hasChanges()) {
      toast({
        title: "No Changes",
        description: "There are no changes to save.",
      });
      return;
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Errors",
        description: "Please fix the validation errors before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const updatedEvent = await updateEvent(eventId, editData);
      
      if (updatedEvent) {
        toast({
          title: "Event Updated",
          description: "Your event has been successfully updated.",
        });
        
        // Reset form state and navigate back
        resetForm();
        router.push(`/dashboard/events/${eventId}`);
      } else {
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    resetForm();
    setShowResetDialog(false);
    toast({
      title: "Changes Reset",
      description: "All changes have been reset to the original values.",
    });
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setShowCancelDialog(true);
    } else {
      router.push(`/dashboard/events/${eventId}`);
    }
  };

  const handleCancelConfirm = () => {
    resetForm();
    router.push(`/dashboard/events/${eventId}`);
  };

  const isDirty = hasChanges();
  const hasValidationErrors = Object.keys(errors).length > 0;

  return (
    <div className="flex items-center gap-2">
      {/* Reset Button */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all changes? This will restore all fields to their original values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Reset Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Button */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            className="flex items-center gap-2"
            onClick={handleCancel}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to discard them and return to the event page?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={!isDirty || isSaving || hasValidationErrors}
        className="flex items-center gap-2"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}