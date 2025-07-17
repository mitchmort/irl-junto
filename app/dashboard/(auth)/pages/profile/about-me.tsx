"use client";

import * as React from "react";
import { useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/store/useProfileStore";
import { useAuth } from "@/components/auth/auth-provider";

export function AboutMe() {
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