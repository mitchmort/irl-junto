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

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eventId = parseInt(id, 10);

  if (isNaN(eventId)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Invalid Event ID</h2>
          <p className="text-muted-foreground mt-2">The event ID provided is not valid.</p>
        </div>
      </div>
    );
  }

  return <EventPage eventId={eventId} />;
}