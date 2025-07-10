"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { CalendarPlus, Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { UpcomingEvents } from "@/app/dashboard/(auth)/apps/calendar/upcoming-events";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CalendarSidebar() {
  const router = useRouter();

  return (
    <div className="sticky top-20 hidden space-y-4 xl:block">
      <Button onClick={() => router.push('/dashboard/events/create?step=1')} className="w-full">
        <CalendarPlus /> Add Event
      </Button>
      <ScrollArea className="h-[calc(100vh-9.8rem)]">
        <UpcomingEvents />
      </ScrollArea>
    </div>
  );
}

export function CalendarMobileSidebar() {
  const router = useRouter();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Upcoming Events</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <UpcomingEvents />
        </div>
        <Button onClick={() => router.push('/dashboard/events/create?step=1')} className="w-full">
          <CalendarPlus /> Add Event
        </Button>
      </SheetContent>
    </Sheet>
  );
}
