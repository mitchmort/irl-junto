import { generateMeta } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

// Lazy load heavy calendar components
const CalendarApp = dynamic(() => import("@/app/dashboard/(auth)/apps/calendar/calendar-app"), {
  loading: () => <Skeleton className="h-96 w-full" />
});

const CalendarSidebar = dynamic(() => import("@/app/dashboard/(auth)/apps/calendar/calendar-sidebar"), {
  loading: () => <Skeleton className="h-96 w-64" />
});

const EventSheet = dynamic(() => import("@/app/dashboard/(auth)/apps/calendar/event-sheet"));

const EventDetailsSheetWrapper = dynamic(() => import("@/app/dashboard/(auth)/apps/calendar/event-details-sheet-wrapper"));

const EventCreationConfirmationModal = dynamic(() => import("@/app/dashboard/(auth)/apps/calendar/event-creation-confirmation-modal"));

export async function generateMetadata() {
  return generateMeta({
    title: "Calendar",
    description:
      "Plan your events or tasks in an organized way with the Calendar app template. Built with shadcn/ui, Next.js and Tailwind CSS.",
    canonical: "/apps/calendar"
  });
}

export default function Page() {
  return (
    <div className="flex lg:space-x-5">
      <CalendarSidebar />
      <div className="grow">
        <CalendarApp />
      </div>
      <EventSheet />
      <EventDetailsSheetWrapper />
      <EventCreationConfirmationModal />
    </div>
  );
}
