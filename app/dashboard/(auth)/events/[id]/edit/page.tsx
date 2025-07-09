import { redirect } from "next/navigation";
import { EventEditPage } from "@/components/event-edit/event-edit-page";

interface EventEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventEdit({ params }: EventEditPageProps) {
  const { id } = await params;
  
  // Convert id to number and validate
  const eventId = parseInt(id);
  if (isNaN(eventId)) {
    redirect("/dashboard/events");
  }

  return <EventEditPage eventId={eventId} />;
}