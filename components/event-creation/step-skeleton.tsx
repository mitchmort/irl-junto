"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function StepSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Title skeleton */}
      <Skeleton className="h-8 w-3/4" />
      
      {/* Option cards skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      
      {/* Action button skeleton */}
      <Skeleton className="h-14 w-full rounded-lg mt-8" />
    </div>
  );
}

export function InputStepSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title skeleton */}
      <Skeleton className="h-8 w-2/3" />
      
      {/* Input field skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
      
      {/* Secondary input skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
      
      {/* Action button skeleton */}
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  );
}