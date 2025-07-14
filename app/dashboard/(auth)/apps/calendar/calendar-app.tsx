"use client";

import React, { useEffect } from "react";

import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  DateClickArg,
  EventDragStopArg,
  EventResizeStopArg
} from "@fullcalendar/interaction";
import useCalendarEventStore from "@/store/useCalendarEventStore";
import { eventColors } from "@/app/dashboard/(auth)/apps/calendar/data";
import { EventClickArg } from "@fullcalendar/core";
import CalendarToolbar from "@/app/dashboard/(auth)/apps/calendar/calendar-toolbar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import EventPreviewModal from "@/app/dashboard/(auth)/apps/calendar/event-preview-modal";

const CalendarApp = React.memo(function CalendarApp() {
  const calendarRef = React.useRef<FullCalendar>(null);
  
  const { 
    events, 
    loading, 
    error, 
    setSelectedEvent, 
    setOpenSheet, 
    fetchEvents,
    previewModalOpen,
    previewEvent,
    setPreviewModalOpen,
    setPreviewEvent,
    setDetailsSheetOpen,
    setDetailsSheetEvent,
    setCreateEventConfirmModalOpen,
    setSelectedDate
  } = useCalendarEventStore();

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Helper function to check if a date is in the past
  const isDateInPast = (clickedDate: Date): boolean => {
    const today = new Date();
    // Set time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    
    const selectedDate = new Date(clickedDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    return selectedDate < today;
  };

  const handleDateClick = (arg: DateClickArg) => {
    // Only open modal for today or future dates
    if (!isDateInPast(arg.date)) {
      setSelectedDate(arg.date);
      setCreateEventConfirmModalOpen(true);
    }
    // For past dates, do nothing (no modal, no feedback)
  };

  const handleEventClick = (e: EventClickArg) => {
    const event = events.find((event) => event.id === e.event.id);
    if (event) {
      setDetailsSheetEvent(event);
      setDetailsSheetOpen(true);
    }
  };

  const handleEventResizeStop = (e: EventResizeStopArg) => {
    toast.success("Event resize...");
  };

  const handleEventDragStop = (e: EventDragStopArg) => {
    toast.success("Event drag-drop...");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8 mb-4" />
          <p className="text-sm text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading events</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={fetchEvents}
            className="px-4 py-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <CalendarToolbar calendarRef={calendarRef} />
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={false}
        editable={true}
        selectable={true}
        eventResizableFromStart={true}
        dateClick={(e) => handleDateClick(e)}
        eventResizeStop={handleEventResizeStop}
        eventDragStop={handleEventDragStop}
        eventClick={handleEventClick}
        events={[
          ...events.map((event) => ({
            ...event,
            classNames: eventColors[event.color ?? "blue"]
          }))
        ]}
        height="calc(100vh - 10rem)"
      />
      <EventPreviewModal
        event={previewEvent}
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
      />
    </>
  );
});

CalendarApp.displayName = 'CalendarApp';

export default CalendarApp;
