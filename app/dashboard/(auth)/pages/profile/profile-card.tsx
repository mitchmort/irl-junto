"use client";

import * as React from "react";
import { Link2Icon, Mail, MapPin, PhoneCall, User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileCard() {
  const { user, profile, loading } = useAuth();

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

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
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
              <h5 className="text-lg font-semibold">-</h5>
              <div className="text-muted-foreground text-sm">Events</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">-</h5>
              <div className="text-muted-foreground text-sm">Activities</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold">-</h5>
              <div className="text-muted-foreground text-sm">Connections</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-muted-foreground size-4" /> 
              {user.email}
            </div>
            {profile?.username && (
              <div className="flex items-center gap-3">
                <User className="text-muted-foreground size-4" /> 
                @{profile.username}
              </div>
            )}
            {profile?.updated_at && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">
                  Member since {new Date(profile.updated_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
