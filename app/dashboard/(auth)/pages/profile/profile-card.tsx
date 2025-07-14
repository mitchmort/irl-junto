"use client";

import * as React from "react";
import { Link2Icon, MapPin, PhoneCall, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileData } from "@/hooks/use-profile-data";

// Sports mapping to display proper labels
const SPORTS_LABELS: Record<string, string> = {
  basketball: "Basketball",
  tennis: "Tennis", 
  pickleball: "Pickleball",
  volleyball: "Volleyball",
  soccer: "Soccer",
  climbing: "Climbing",
};

export function ProfileCard() {
  const { user, loading: authLoading } = useAuth();
  const { data: profileData, isLoading: profileLoading, error } = useProfileData(user?.id);

  const loading = authLoading || profileLoading;
  
  // Extract data from consolidated hook
  const profile = profileData?.profile;
  const stats = profileData?.stats || {
    totalSports: 0,
    totalEvents: 0,
    organizedEvents: 0,
    recentActivities: 0
  };

  if (loading) {
    return (
      <Card className="relative">
        <CardContent>
          <div className="space-y-12">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="size-20 rounded-full" />
              <div className="text-center space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="relative">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Please sign in to view your profile</p>
        </CardContent>
      </Card>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="relative">
      <CardContent>
        {profile?.role && (
          <Badge className="absolute start-4 top-4 capitalize">
            {profile.role}
          </Badge>
        )}
        <div className="space-y-12">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="size-20">
              <AvatarImage 
                src={profile?.avatar_url || user.user_metadata?.avatar_url} 
                alt={displayName} 
              />
              <AvatarFallback>
                {initials || <User className="size-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h5 className="text-xl font-semibold">{displayName}</h5>
              <div className="text-muted-foreground text-sm">
                {profile?.username ? `@${profile.username}` : 'Junto Member'}
              </div>
            </div>
          </div>
          
          <div className="bg-muted grid grid-cols-3 divide-x rounded-md border text-center *:py-3">
            <div>
              <h5 className="text-lg font-semibold">{profile?.sports?.length || 0}</h5>
              <div className="text-muted-foreground text-sm">Sports Played</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">{stats.totalEvents}</h5>
              <div className="text-muted-foreground text-sm">Total Events</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">{stats.organizedEvents}</h5>
              <div className="text-muted-foreground text-sm">Events Organized</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-y-4">
            {profile?.username && (
              <div className="flex items-center gap-3">
                <User className="text-muted-foreground size-4" /> 
                <span className="text-sm">@{profile.username}</span>
              </div>
            )}
            {profile?.sports && profile.sports.length > 0 && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {profile.sports.map((sportId) => (
                    <Badge key={sportId} variant="outline" className="text-xs">
                      {SPORTS_LABELS[sportId] || sportId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {profile?.updated_at && (
              <div className="text-xs text-muted-foreground">
                Member since {new Date(profile.updated_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
