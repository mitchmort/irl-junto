"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/store/useProfileStore";

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
  const { profile, loading } = useProfileStore();

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