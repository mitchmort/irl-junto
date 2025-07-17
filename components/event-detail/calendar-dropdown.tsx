"use client";

import React, { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Download, Link2, Calendar, Loader2 } from "lucide-react";
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
  const [isDownloading, setIsDownloading] = useState(false);
  const calendarData = { event, organizerName, participantCount };
  const urls = generateCalendarUrls(calendarData);
  
  const handleGoogleCalendar = () => {
    try {
      window.open(urls.google, '_blank');
      toast.success("Opening Google Calendar", {
        description: "Add the event to your Google Calendar in the new tab.",
      });
    } catch (error) {
      toast.error("Failed to open Google Calendar", {
        description: "Please try again or use the download option.",
      });
    }
  };
  
  const handleAppleCalendar = () => {
    try {
      // For Apple Calendar, we'll use the webcal URL which works better
      window.location.href = urls.webcal;
      toast.success("Opening Apple Calendar", {
        description: "Your calendar app should open automatically. Confirm to add the event.",
      });
    } catch (error) {
      toast.error("Failed to open Apple Calendar", {
        description: "Please try the download option instead.",
      });
    }
  };
  
  const handleOutlook = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      // Outlook also works well with .ics download
      downloadICalendar(calendarData);
      toast.success("Calendar file downloaded", {
        description: "Open the downloaded file to add the event to Outlook.",
      });
    } catch (error) {
      toast.error("Download failed", {
        description: "Please try again or use Google Calendar option.",
      });
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };
  
  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      downloadICalendar(calendarData);
      toast.success("Calendar file downloaded", {
        description: "Open the downloaded .ics file with your preferred calendar app.",
      });
    } catch (error) {
      toast.error("Download failed", {
        description: "Please try again.",
      });
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
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
        <Button variant={variant} className={className} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CalendarPlus className="w-4 h-4 mr-2" />
          )}
          {isDownloading ? 'Downloading...' : 'Add to Calendar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Choose Calendar</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleGoogleCalendar} disabled={isDownloading}>
          <Calendar className="w-4 h-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleAppleCalendar} disabled={isDownloading}>
          <Calendar className="w-4 h-4 mr-2" />
          Apple Calendar
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleOutlook} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Calendar className="w-4 h-4 mr-2" />
          )}
          Outlook
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download .ics file
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSubscribe} disabled={isDownloading}>
          <Link2 className="w-4 h-4 mr-2" />
          Copy subscription link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}