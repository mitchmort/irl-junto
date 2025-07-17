"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { CalendarDropdown } from "./calendar-dropdown";
import { EditableDate } from "@/components/event-edit/editable-date";
import { EditableTime } from "@/components/event-edit/editable-time";
import { cn } from "@/lib/utils";

interface DateTimeSectionProps {
  event: {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    organizer?: string | null;
  };
  participantCount?: number;
  editMode?: boolean;
  className?: string;
}

export function DateTimeSection({ 
  event, 
  participantCount,
  editMode = false,
  className
}: DateTimeSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className={cn("py-2 gap-2", className)}>
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Date and Time Display */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-2">
              {/* Date Section */}
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  {editMode ? (
                    <EditableDate
                      fieldName="date"
                      value={event.date}
                      className="font-semibold"
                      onValidate={(value) => {
                        const date = new Date(value);
                        if (date < new Date()) {
                          return "Event date cannot be in the past";
                        }
                        return null;
                      }}
                    />
                  ) : (
                    <p className="font-semibold">{formatDate(event.date)}</p>
                  )}
                </div>
              </div>

              {/* Time Section */}
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  {editMode ? (
                    <EditableTime
                      fieldName="time"
                      value={event.time}
                      className="font-semibold"
                    />
                  ) : (
                    <p className="font-semibold">{formatTime(event.time)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Add to Calendar Button */}
            {!editMode && (
              <div className="flex-shrink-0">
                <CalendarDropdown
                  event={event}
                  organizerName={event.organizer || undefined}
                  participantCount={participantCount}
                  className="w-full sm:w-auto"
                  variant="outline"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}