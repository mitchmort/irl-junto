"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileStore } from "@/store/useProfileStore";

export function SocialLinks() {
  const { profile, loading } = useProfileStore();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Parse social links from profile - handle both old and new formats
  const socialLinks = Array.isArray(profile?.social_links) 
    ? profile.social_links
        .filter((link: any) => {
          // Handle both {value: string} format and direct string format
          const url = typeof link === 'string' ? link : link?.value;
          return url && url.trim() !== '';
        })
        .map((link: any) => typeof link === 'string' ? link : link.value)
    : [];

  const getDomainFromUrl = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Link';
    }
  };

  const openLink = (url: string) => {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
      </CardHeader>
      <CardContent>
        {socialLinks.length > 0 ? (
          <div className="space-y-3">
            {socialLinks.map((url: string, index: number) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between"
                onClick={() => openLink(url)}
              >
                <span className="truncate">{getDomainFromUrl(url)}</span>
                <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No social links added yet. Add them in your profile settings!
          </p>
        )}
      </CardContent>
    </Card>
  );
}