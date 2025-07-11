"use client";

import * as React from "react";
import { Link2Icon, Mail, MapPin, PhoneCall, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/store/useProfileStore";

export function ProfileCard() {
  const { user, loading: authLoading } = useAuth();
  const { profile, fetchProfile, loading: profileLoading } = useProfileStore();

  // Load profile data if not already loaded
  React.useEffect(() => {
    if (user?.id && !profile && !profileLoading) {
      fetchProfile(user.id);
    }
  }, [user?.id, profile, profileLoading, fetchProfile]);

  const loading = authLoading || profileLoading;

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

  // Calculate profile completeness
  const profileFields = [
    profile?.full_name,
    profile?.bio,
    profile?.avatar_url,
    profile?.sports?.length,
    profile?.social_links && Array.isArray(profile.social_links) && profile.social_links.length > 0
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

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
              <div className="text-muted-foreground text-sm">Sports</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">{completionPercentage}%</h5>
              <div className="text-muted-foreground text-sm">Complete</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">
                {profile?.social_links && Array.isArray(profile.social_links) ? profile.social_links.length : 0}
              </h5>
              <div className="text-muted-foreground text-sm">Links</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-muted-foreground size-4" /> 
              <span className="text-sm">{user?.email}</span>
            </div>
            {profile?.username && (
              <div className="flex items-center gap-3">
                <User className="text-muted-foreground size-4" /> 
                <span className="text-sm">@{profile.username}</span>
              </div>
            )}
            {profile?.bio && (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {profile.bio}
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
