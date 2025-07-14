"use client";

import { Suspense, useState, useMemo } from "react";
import { generateMeta } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useUserEvents } from "@/hooks/use-user-events";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EventList from "@/app/dashboard/(auth)/events/event-list";
import ErrorBoundary from "@/components/error-boundary";

// Loading skeleton component
function EventsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-28" />
      </div>
      
      {/* Enhanced stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-5 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      
      {/* Enhanced table skeleton */}
      <div className="pt-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <div className="ml-auto">
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Desktop table skeleton */}
              <div className="hidden md:block">
                <div className="border rounded-lg">
                  <div className="border-b px-4 py-3">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="border-b last:border-b-0 px-4 py-3">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-4" />
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-lg" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile cards skeleton */}
              <div className="md:hidden space-y-3">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-18 rounded-full" />
                      </div>
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination skeleton */}
              <div className="flex items-center justify-between pt-4">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function EventsContent() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // Map filter to the correct parameters for useUserEvents
  const getEventFilters = useMemo(() => {
    const baseFilters = {
      page: currentPage,
      limit: 20,
      search: debouncedSearch
    };
    
    switch (filter) {
      case 'organized':
        return { ...baseFilters, type: 'organized' as const };
      case 'joined':
        return { ...baseFilters, type: 'joined' as const };
      case 'completed':
        return { ...baseFilters, type: 'all' as const, status: ['completed'] as ('upcoming' | 'cancelled' | 'completed')[] };
      default:
        return { ...baseFilters, type: 'all' as const };
    }
  }, [filter, currentPage, debouncedSearch]);
  
  const { events, loading, error, getEventStats, totalCount, hasNextPage, hasPreviousPage } = useUserEvents(getEventFilters);
  const stats = getEventStats(events);
  
  // Reset to page 1 when filter or search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
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
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          currentPage={currentPage}
          totalCount={totalCount}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function Page() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<EventsPageSkeleton />}>
        <EventsContent />
      </Suspense>
    </ErrorBoundary>
  );
}