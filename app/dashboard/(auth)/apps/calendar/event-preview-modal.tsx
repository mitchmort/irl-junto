"use client";

import React from "react";
import Link from "next/link";
import { EventInput } from "@fullcalendar/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventPreviewModalProps {
  event: EventInput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to get sport emoji
const getSportEmoji = (sport: string): string => {
  const sportEmojis: { [key: string]: string } = {
    Basketball: "🏀",
    Tennis: "🎾",
    Pickleball: "🏓",
    Volleyball: "🏐",
    Soccer: "⚽",
    Baseball: "⚾",
    Football: "🏈",
    Golf: "⛳",
    Badminton: "🏸",
    Squash: "🎾",
    "Table Tennis": "🏓",
    Swimming: "🏊",
    Climbing: "🧗",
  };
  return sportEmojis[sport] || "🏃";
};

// Helper function to format date and time
const formatDateTime = (start: string | Date | undefined): string => {
  if (!start) return "Date TBD";
  
  const date = new Date(start);
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
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  
  return `${dateStr}, ${timeStr}`;
};

// Helper function to parse location JSON
const parseLocation = (location: string | undefined): string => {
  if (!location) return "Location TBD";
  
  try {
    const loc = JSON.parse(location);
    return loc.name || loc.address || "Location TBD";
  } catch {
    return location || "Location TBD";
  }
};

export default function EventPreviewModal({
  event,
  open,
  onOpenChange,
}: EventPreviewModalProps) {
  if (!event || !event.extendedProps) return null;
  
  const { extendedProps } = event;
  const sport = extendedProps.sport || "";
  const participantCount = extendedProps.participant_count || 0;
  const maxParticipants = extendedProps.max_participants || 0;
  const urlSlug = extendedProps.url_slug || event.id;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 max-w-sm",
          // Mobile: bottom sheet style
          "sm:rounded-lg rounded-t-xl",
          "sm:top-[50%] sm:translate-y-[-50%]",
          "bottom-0 top-auto translate-y-0",
          "sm:max-h-[90vh] max-h-[50vh]"
        )}
      >
        <DialogHeader className="px-4 pt-3 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg pr-8">
            <span className="text-xl">{getSportEmoji(sport)}</span>
            <span className="truncate">{event.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-4 py-3 space-y-2">
          {/* Date & Time */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>{formatDateTime(event.start)}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{parseLocation(extendedProps.location)}</span>
          </div>
          
          {/* Participants */}
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span>
              {participantCount}/{maxParticipants} spots filled
            </span>
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="px-4 pb-3 pt-1 border-t mt-auto">
          <Button asChild className="w-full">
            <Link href={`/dashboard/events/${urlSlug}`}>
              View Full Details →
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}