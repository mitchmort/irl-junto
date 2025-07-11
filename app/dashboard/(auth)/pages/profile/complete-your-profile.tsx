"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProfileStore } from "@/store/useProfileStore";

export function CompleteYourProfileCard() {
  const { profile, loading } = useProfileStore();

  // Calculate profile completeness
  const calculateCompletion = () => {
    if (!profile) return 0;
    
    const profileFields = [
      profile?.full_name,
      profile?.bio,
      profile?.avatar_url,
      profile?.sports?.length,
      profile?.social_links && Array.isArray(profile.social_links) && profile.social_links.length > 0
    ];
    const completedFields = profileFields.filter(Boolean).length;
    return Math.round((completedFields / profileFields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  // Don't render if profile is 100% complete
  if (completionPercentage === 100) {
    return null;
  }

  // Don't render while loading
  if (loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardAction>
          <Badge variant="outline">{completionPercentage}%</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={completionPercentage} />
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard/pages/settings/profile">
            Complete Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
