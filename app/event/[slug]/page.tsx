import { redirect } from "next/navigation";
import { generateMeta } from "@/lib/utils";

export async function generateMetadata() {
  return generateMeta({
    title: "Event Details",
    description: "View event details and join sports events on Junto.",
    canonical: "/event/detail"
  });
}

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Redirect to the dashboard event page
  // This ensures all event access goes through the authenticated dashboard route
  // which handles permissions, authentication, and user-specific UI properly
  redirect(`/dashboard/events/${slug}`);
}