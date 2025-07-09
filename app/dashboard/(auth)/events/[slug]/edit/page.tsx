import { redirect } from "next/navigation";
import { EventEditPage } from "@/components/event-edit/event-edit-page";

interface EventEditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventEdit({ params }: EventEditPageProps) {
  const { slug } = await params;
  
  // Check if slug is actually a numeric ID (for backward compatibility)
  const eventId = parseInt(slug, 10);
  
  if (!isNaN(eventId)) {
    // Legacy numeric ID support
    return <EventEditPage eventId={eventId} />;
  } else {
    // New slug-based lookup
    return <EventEditPage eventSlug={slug} />;
  }
}