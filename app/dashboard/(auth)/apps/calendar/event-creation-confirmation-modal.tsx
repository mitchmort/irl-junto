"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import useCalendarEventStore from "@/store/useCalendarEventStore";

export default function EventCreationConfirmationModal() {
  const router = useRouter();
  const { 
    createEventConfirmModalOpen, 
    selectedDate, 
    setCreateEventConfirmModalOpen 
  } = useCalendarEventStore();

  const formatSelectedDate = (date: Date | null): string => {
    if (!date) return "Selected Date";
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateStr = "";
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      dateStr = "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = "Tomorrow";
    } else {
      dateStr = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    
    return dateStr;
  };

  const handleCreateEvent = () => {
    setCreateEventConfirmModalOpen(false);
    router.push('/dashboard/events/create?step=1');
  };

  const handleCancel = () => {
    setCreateEventConfirmModalOpen(false);
  };

  return (
    <Dialog open={createEventConfirmModalOpen} onOpenChange={setCreateEventConfirmModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Create New Event?
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Creating events on Junto takes just 30 seconds!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Selected Date Display */}
          <div className="flex items-center justify-center gap-3 rounded-lg bg-muted/50 p-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Selected Date</p>
              <p className="font-medium">{formatSelectedDate(selectedDate)}</p>
            </div>
          </div>
          
          {/* Process Description */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Our simple 9-step process will get your game organized quickly</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleCreateEvent} className="w-full">
            Yes, Create Event
          </Button>
          <Button onClick={handleCancel} variant="outline" className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}