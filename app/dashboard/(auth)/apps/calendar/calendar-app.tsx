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

export default function CalendarApp() {
  const calendarRef = React.useRef<FullCalendar>(null);
  const { events, loading, error, setSelectedEvent, setOpenSheet, fetchEvents } = useCalendarEventStore();

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDateClick = (arg: DateClickArg) => {
    setOpenSheet(true);
  };

  const handleEventClick = (e: EventClickArg) => {
    const event = events.find((event) => event.id === e.event.id);
    if (event) setSelectedEvent(event);
    setOpenSheet(true);
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
          <button 
            onClick={fetchEvents}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
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
    </>
  );
}
