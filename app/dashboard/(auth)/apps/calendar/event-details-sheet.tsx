"use client";

import React from "react";
import Link from "next/link";
import { EventInput, DateInput } from "@fullcalendar/core";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign, 
  Edit, 
  ExternalLink, 
  Copy,
  Target,
  Package,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";
import useCalendarEventStore from "@/store/useCalendarEventStore";

interface EventDetailsSheetProps {
  event: EventInput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditClick?: () => void;
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
const formatDateTime = (start: DateInput | undefined): string => {
  if (!start) return "Date TBD";
  
  // Handle different DateInput types - convert to Date
  let date: Date;
  if (start instanceof Date) {
    date = start;
  } else if (typeof start === 'string' || typeof start === 'number') {
    date = new Date(start);
  } else {
    return "Date TBD";
  }
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
const parseLocation = (location: string | undefined): { name?: string; address: string; fullAddress: string } => {
  if (!location) return { address: "Location TBD", fullAddress: "Location TBD" };
  
  try {
    const loc = JSON.parse(location);
    return {
      name: loc.name,
      address: loc.address || "Location TBD",
      fullAddress: loc.address || location
    };
  } catch {
    return { 
      address: location || "Location TBD",
      fullAddress: location || "Location TBD"
    };
  }
};

// Helper function to format cost
const formatCost = (cost: number | null | undefined): string => {
  if (!cost || cost === 0) return "Free";
  return `$${cost}`;
};

// Helper function to parse skill levels
const parseSkillLevels = (skillLevels: any): string[] => {
  if (!skillLevels) return [];
  if (Array.isArray(skillLevels)) return skillLevels;
  if (typeof skillLevels === 'string') {
    try {
      const parsed = JSON.parse(skillLevels);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [skillLevels];
    }
  }
  return [];
};

// Helper function to safely convert DateInput to Date
const safeDateConversion = (dateInput: DateInput | undefined): Date => {
  if (!dateInput) return new Date();
  
  if (dateInput instanceof Date) {
    return dateInput;
  } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
    return new Date(dateInput);
  } else {
    return new Date();
  }
};

// Helper function to get event status
const getEventStatus = (event: EventInput): { status: string; variant: "default" | "secondary" | "destructive" | "warning" } => {
  if (!event || !event.extendedProps) return { status: "upcoming", variant: "default" };
  
  const { status, participant_count, max_participants } = event.extendedProps;
  const eventDate = safeDateConversion(event.start);
  const now = new Date();
  
  if (status === 'cancelled') {
    return { status: "Cancelled", variant: "destructive" };
  } else if (eventDate < now) {
    return { status: "Completed", variant: "secondary" };
  } else if (participant_count >= max_participants) {
    return { status: "Full", variant: "warning" };
  } else {
    return { status: "Open", variant: "default" };
  }
};

export default function EventDetailsSheet({
  event,
  open,
  onOpenChange,
  onEditClick,
}: EventDetailsSheetProps) {
  const { user } = useAuth();
  
  if (!event || !event.extendedProps) return null;
  
  const { extendedProps } = event;
  const sport = extendedProps.sport || "";
  const participantCount = extendedProps.participant_count || 0;
  const maxParticipants = extendedProps.max_participants || 0;
  const urlSlug = extendedProps.url_slug || event.id;
  const cost = extendedProps.cost;
  const duration = extendedProps.duration;
  const description = extendedProps.description || event.description;
  const skillLevels = parseSkillLevels(extendedProps.skill_levels);
  const equipmentRequirements = extendedProps.equipment_requirements;
  const arrivalInstructions = extendedProps.arrival_instructions;
  const location = parseLocation(extendedProps.location);
  const eventStatus = getEventStatus(event);
  
  // Check if current user is the organizer
  const isOrganizer = user?.id === extendedProps.organizer;
  
  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(location.fullAddress);
    toast.success("Address copied to clipboard");
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className={cn(
          "overflow-y-auto w-full sm:max-w-lg",
          "p-0", // Remove default padding to control it ourselves
        )}
      >
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <SheetTitle className="flex items-center gap-3 text-xl pr-8">
              <span className="text-2xl">{getSportEmoji(sport)}</span>
              <span className="break-words">{event.title}</span>
            </SheetTitle>
            <Badge variant={eventStatus.variant} className="shrink-0">
              {eventStatus.status}
            </Badge>
          </div>
        </SheetHeader>
        
        <div className="px-6 pb-6 space-y-6">
          {/* Date & Time Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="text-sm font-medium">{formatDateTime(event.start)}</p>
                {duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Location Section */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                {location.name && (
                  <p className="text-sm font-medium">{location.name}</p>
                )}
                <p className="text-sm text-muted-foreground">{location.address}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy address
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Participants & Cost Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {participantCount}/{maxParticipants} spots filled
                </p>
              </div>
            </div>
            
            {cost !== null && cost !== undefined && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-medium">{formatCost(cost)}</p>
              </div>
            )}
          </div>
          
          {/* Requirements Section */}
          {(skillLevels.length > 0 || equipmentRequirements) && (
            <>
              <Separator />
              <div className="space-y-3">
                {skillLevels.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Skill Level</p>
                      <p className="text-sm text-muted-foreground">
                        {skillLevels.join(", ")}
                      </p>
                    </div>
                  </div>
                )}
                
                {equipmentRequirements && (
                  <div className="flex items-start gap-3">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Equipment</p>
                      <p className="text-sm text-muted-foreground">
                        {equipmentRequirements}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Description Section */}
          {description && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </>
          )}
          
          {/* Arrival Instructions Section */}
          {arrivalInstructions && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Arrival Instructions</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {arrivalInstructions}
                </p>
              </div>
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="border-t px-6 py-4 space-y-3 bg-muted/5">
          {isOrganizer && (
            <Button 
              onClick={onEditClick}
              className="w-full"
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Event
            </Button>
          )}
          
          <Button asChild className="w-full" variant={isOrganizer ? "default" : "default"}>
            <Link href={`/dashboard/events/${urlSlug}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Details
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}