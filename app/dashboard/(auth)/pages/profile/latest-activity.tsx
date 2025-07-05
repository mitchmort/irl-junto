"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserActivity } from "@/hooks/use-user-activity";

// Map sport types to icons for better visual representation
const getSportIcon = (sport: string) => {
  switch (sport.toLowerCase()) {
    case 'basketball':
      return '🏀';
    case 'soccer':
      return '⚽';
    case 'tennis':
      return '🎾';
    case 'running':
      return '🏃';
    case 'volleyball':
      return '🏐';
    case 'hiking':
      return '🥾';
    default:
      return '⚽';
  }
};

// Format date to be more readable
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format time to be more readable
const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export function LatestActivity() {
  const { activities, loading, error } = useUserActivity();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Unable to load activity data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Latest Activity</CardTitle>
          <Link
            href="/dashboard/pages/profile?tab=activities"
            className="text-muted-foreground hover:text-primary text-sm hover:underline">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-sm">
              No past activities found. Join your first event to see your activity here!
            </div>
          </div>
        ) : (
          <ol className="relative border-s">
            {activities.map((activity, index) => (
              <li key={activity.id} className={`ms-6 ${index < activities.length - 1 ? 'mb-10' : ''} space-y-2`}>
                <span className="bg-muted absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                  {getSportIcon(activity.sport)}
                </span>
                <h3 className="flex items-center font-semibold">
                  {activity.role === 'organizer' ? 'Organized' : 'Joined'} {activity.title}
                  <Badge variant="outline" className="ms-2 capitalize">
                    {activity.role}
                  </Badge>
                </h3>
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="size-3" />
                    {formatDate(activity.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="size-3" />
                    {formatTime(activity.time)}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPinIcon className="size-3" />
                  {activity.location}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <UsersIcon className="size-3" />
                  {activity.participant_count} {activity.participant_count === 1 ? 'participant' : 'participants'}
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
