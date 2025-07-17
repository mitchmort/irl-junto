"use client";

import * as React from "react";
import { useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/store/useProfileStore";
import { useAuth } from "@/components/auth/auth-provider";

// Sports mapping to display proper labels
const SPORTS_LABELS: Record<string, string> = {
  basketball: "Basketball",
  tennis: "Tennis", 
  pickleball: "Pickleball",
  volleyball: "Volleyball",
  soccer: "Soccer",
  climbing: "Climbing",
};

export function CardSkills() {
  const { user } = useAuth();
  const { profile, loading, fetchProfile } = useProfileStore();

  // Fetch profile if not already loaded
  useEffect(() => {
    if (user?.id && !profile && !loading) {
      fetchProfile(user.id);
    }
  }, [user?.id, profile, loading]); // Removed fetchProfile from dependencies

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const userSports = profile?.sports || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {userSports.length > 0 ? (
            userSports.map((sportId) => (
              <Badge key={sportId} variant="outline">
                {SPORTS_LABELS[sportId] || sportId}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No sports selected yet. Add your interests in profile settings!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}