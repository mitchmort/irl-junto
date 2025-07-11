"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/store/useProfileStore";

export function AboutMe() {
  const { profile, loading } = useProfileStore();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>About Me</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  const displayBio = profile?.bio || "No bio added yet. Share something about yourself in your profile settings!";

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Me</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {displayBio}
        </div>
      </CardContent>
    </Card>
  );
}