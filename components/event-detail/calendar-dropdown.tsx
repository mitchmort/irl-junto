"use client";

import React from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Download, Link2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { generateCalendarUrls, downloadICalendar } from '@/lib/calendar-export';
import { Event } from '@/types/database';

interface CalendarDropdownProps {
  event: Event;
  organizerName?: string;
  participantCount?: number;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function CalendarDropdown({ 
  event, 
  organizerName, 
  participantCount,
  className,
  variant = "outline"
}: CalendarDropdownProps) {
  const calendarData = { event, organizerName, participantCount };
  const urls = generateCalendarUrls(calendarData);
  
  const handleGoogleCalendar = () => {
    window.open(urls.google, '_blank');
    toast.success("Opening Google Calendar", {
      description: "Add the event to your Google Calendar in the new tab.",
    });
  };
  
  const handleAppleCalendar = () => {
    // For Apple Calendar, we'll use the webcal URL which works better
    window.location.href = urls.webcal;
    toast.success("Opening Apple Calendar", {
      description: "Your calendar app should open automatically. Confirm to add the event.",
    });
  };
  
  const handleOutlook = () => {
    // Outlook also works well with .ics download
    downloadICalendar(calendarData);
    toast.success("Calendar file downloaded", {
      description: "Open the downloaded file to add the event to Outlook.",
    });
  };
  
  const handleDownload = () => {
    downloadICalendar(calendarData);
    toast.success("Calendar file downloaded", {
      description: "Open the downloaded .ics file with your preferred calendar app.",
    });
  };
  
  const handleSubscribe = async () => {
    const webcalUrl = urls.webcal;
    
    try {
      await navigator.clipboard.writeText(webcalUrl);
      toast.success("Subscription URL copied!", {
        description: "Paste this URL in your calendar app to subscribe to updates.",
      });
    } catch (error) {
      toast.error("Failed to copy subscription URL", {
        description: "Please try again.",
      });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={className}>
          <CalendarPlus className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Calendar</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleGoogleCalendar}>
          <Calendar className="w-4 h-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleAppleCalendar}>
          <Calendar className="w-4 h-4 mr-2" />
          Apple Calendar
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleOutlook}>
          <Calendar className="w-4 h-4 mr-2" />
          Outlook
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download .ics file
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSubscribe}>
          <Link2 className="w-4 h-4 mr-2" />
          Copy subscription link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}