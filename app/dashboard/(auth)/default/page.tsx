import { generateMeta } from "@/lib/utils";

import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";

import {
  NextGameHero,
  QuickStats,
  TeamMessages,
  UpcomingGames,
  PastGamesActivity
} from "@/app/dashboard/(auth)/default/components";
import { Download } from "lucide-react";

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
