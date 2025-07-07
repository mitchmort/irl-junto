import { promises as fs } from "fs";
import path from "path";
import { generateMeta } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EventList from "@/app/dashboard/(auth)/events/event-list";

export async function generateMetadata() {
  return generateMeta({
    title: "My Events",
    description:
      "My Events page for sports coordination. View and manage your upcoming games, organized events, and sports activities. Built with shadcn/ui, Tailwind CSS and Next.js.",
    canonical: "/events"
  });
}

async function getEvents() {
  const data = await fs.readFile(
    path.join(process.cwd(), "app/dashboard/(auth)/events/data.json")
  );
  return JSON.parse(data.toString());
}

// Helper function to calculate statistics from events data
function calculateEventStats(events: any[]) {
  const now = new Date();
  const currentWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => 
    new Date(event.date) > now && event.status !== 'cancelled'
  ).length;
  const organizedEvents = events.filter(event => 
    event.my_role === 'Organizer'
  ).length;
  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= currentWeek && eventDate <= now;
  }).length;

  return {
    totalEvents,
    upcomingEvents,
    organizedEvents,
    thisWeekEvents
  };
}

export default async function Page() {
  const events = await getEvents();
  const stats = calculateEventStats(events);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">My Events</h1>
        <Button asChild>
          <Link href="/dashboard/events/create">
            <PlusCircle /> Create Event
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Events</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">{stats.totalEvents}</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-green-600">+20.1%</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Upcoming Events</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">{stats.upcomingEvents}</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-green-600">+5.02</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Events Organized</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">{stats.organizedEvents}</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-green-600">+3.1%</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>This Week</CardDescription>
            <CardTitle className="font-display text-2xl lg:text-3xl">{stats.thisWeekEvents}</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <span className="text-red-600">-1</span>
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      </div>
      <div className="pt-4">
        <EventList data={events} />
      </div>
    </div>
  );
}