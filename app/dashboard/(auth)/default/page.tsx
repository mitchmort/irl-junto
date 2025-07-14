import { generateMeta } from "@/lib/utils";
import { Suspense } from "react";

import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

import {
  NextGameHero,
  QuickStats,
  UpcomingGames,
} from "@/app/dashboard/(auth)/default/components";
import { Download } from "lucide-react";

// Lazy load heavy components
import dynamic from "next/dynamic";

const TeamMessages = dynamic(
  () => import("@/app/dashboard/(auth)/default/components").then((mod) => ({ default: mod.TeamMessages })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }
);

const PastGamesActivity = dynamic(
  () => import("@/app/dashboard/(auth)/default/components").then((mod) => ({ default: mod.PastGamesActivity })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }
);

export async function generateMetadata() {
  return generateMeta({
    title: "Junto Dashboard",
    description:
      "Your sports coordination dashboard - track games, connect with players, and manage your sports activities. Built with shadcn/ui.",
    canonical: "/default"
  });
}

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Junto Dashboard</h1>
        <div className="flex items-center space-x-2">
          <CustomDateRangePicker />
          <Button>
            <Download />
            <span className="hidden lg:inline">Download</span>
          </Button>
        </div>
      </div>
      <div className="gap-4 space-y-4 lg:grid lg:grid-cols-3 lg:space-y-0">
        <div className="lg:col-span-3">
          <QuickStats />
        </div>
        <div className="lg:col-span-2">
          <NextGameHero />
        </div>
        <PastGamesActivity />
        <div className="lg:col-span-2">
          <UpcomingGames />
        </div>
        <TeamMessages />
      </div>
    </div>
  );
}
