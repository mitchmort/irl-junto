"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { CompleteYourProfileCard } from "./complete-your-profile";

import { Button } from "@/components/ui/button";
import { CardSkills } from "@/app/dashboard/(auth)/pages/profile/card-skills";
import { LatestActivity } from "@/app/dashboard/(auth)/pages/profile/latest-activity";
import { AboutMe } from "@/app/dashboard/(auth)/pages/profile/about-me";
import { ProfileCard } from "@/app/dashboard/(auth)/pages/profile/profile-card";
import { SocialLinks } from "@/app/dashboard/(auth)/pages/profile/social-links";
import { useAuth } from "@/components/auth/auth-provider";
import { useProfileStore } from "@/store/useProfileStore";

export default function Page() {
  const { user } = useAuth();
  const { fetchProfile } = useProfileStore();

  // Ensure profile data is loaded when the page mounts
  useEffect(() => {
    if (user?.id) {
      console.log('🏠 Profile page mounted - fetching profile for user:', user.id);
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Profile Page</h1>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/pages/settings/profile">
              <Settings />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-1">
          <ProfileCard />
          <CompleteYourProfileCard />
          <CardSkills />
        </div>
        <div className="space-y-4 xl:col-span-2">
          <LatestActivity />
          <div className="grid gap-4 xl:grid-cols-2">
            <AboutMe />
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
}
