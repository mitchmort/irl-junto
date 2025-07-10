"use client";

import React from "react";
import EventDetailsSheet from "./event-details-sheet";
import useCalendarEventStore from "@/store/useCalendarEventStore";

export default function EventDetailsSheetWrapper() {
  const { 
    detailsSheetOpen, 
    detailsSheetEvent, 
    setDetailsSheetOpen,
    setOpenSheet,
    setSelectedEvent 
  } = useCalendarEventStore();
  
  const handleEditClick = () => {
    // Close details sheet and open edit sheet with the same event
    setDetailsSheetOpen(false);
    setSelectedEvent(detailsSheetEvent);
    setOpenSheet(true);
  };
  
  return (
    <EventDetailsSheet
      event={detailsSheetEvent}
      open={detailsSheetOpen}
      onOpenChange={setDetailsSheetOpen}
      onEditClick={handleEditClick}
    />
  );
}