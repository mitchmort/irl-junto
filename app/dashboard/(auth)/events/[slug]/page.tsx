import { generateMeta } from "@/lib/utils";
import { EventPage } from "@/components/event-detail/event-page";

export async function generateMetadata() {
  return generateMeta({
    title: "Event Details",
    description:
      "View event details, RSVP status, and participant information for sports events on Junto.",
    canonical: "/events/detail"
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Check if slug is actually a numeric ID (for backward compatibility)
  const eventId = parseInt(slug, 10);
  
  if (!isNaN(eventId)) {
    // Legacy numeric ID support
    return <EventPage eventId={eventId} />;
  } else {
    // New slug-based lookup
    return <EventPage eventSlug={slug} />;
  }
}