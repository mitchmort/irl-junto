"use client";

import { generateMeta } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useUserEvents } from "@/hooks/use-user-events";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EventList from "@/app/dashboard/(auth)/events/event-list";

export default function Page() {
  const { events, loading, error, getEventStats } = useUserEvents({ type: 'all' });
  const stats = getEventStats(events);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="pt-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
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
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-lg font-semibold text-red-600">Error Loading Events</h2>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

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
                <span className="text-muted-foreground">My Events</span>
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
                <span className="text-green-600">Active</span>
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
                <span className="text-blue-600">Organizer</span>
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
                <span className="text-purple-600">Recent</span>
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