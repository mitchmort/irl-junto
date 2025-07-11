"use client";

import { Suspense } from "react";
import { generateMeta } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useUserEvents } from "@/hooks/use-user-events";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EventList from "@/app/dashboard/(auth)/events/event-list";

// Loading skeleton component
function EventsPageSkeleton() {
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

// Main content component that uses useSearchParams
function EventsContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  
  // Map filter to the correct parameters for useUserEvents
  const getEventFilters = () => {
    switch (filter) {
      case 'organized':
        return { type: 'organized' as const };
      case 'joined':
        return { type: 'joined' as const };
      case 'completed':
        return { type: 'all' as const, status: ['completed'] as ('upcoming' | 'cancelled' | 'completed')[] };
      default:
        return { type: 'all' as const };
    }
  };
  
  const { events, loading, error, getEventStats } = useUserEvents(getEventFilters());
  const stats = getEventStats(events);
  
  // Get page title based on filter
  const getPageTitle = () => {
    switch (filter) {
      case 'organized': return 'Manage Events';
      case 'joined': return 'My RSVPs';
      case 'completed': return 'Game History';
      default: return 'My Events';
    }
  };

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
          <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
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
        <h1 className="text-2xl font-bold tracking-tight">{getPageTitle()}</h1>
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
        <EventList 
          data={events} 
          hideFilters={filter !== 'all'}
          filterContext={filter}
        />
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function Page() {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsContent />
    </Suspense>
  );
}