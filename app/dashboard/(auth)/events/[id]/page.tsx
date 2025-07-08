import { generateMeta } from "@/lib/utils";
import EventMapLocation from "./event-map-location";
import {
  Calendar,
  Clock,
  Edit3Icon,
  Share2,
  StarIcon,
  Trash2Icon,
  Trophy,
  Users
} from "lucide-react";

// TypeScript interface for event data
interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location_address: string;
  location_city: string;
  location_zip: string;
  venue_name?: string;
  activity_type: string;
  subcategory: string;
  skill_level: 'Beginner' | 'Casual' | 'Intermediate' | 'Advanced' | 'Pro';
  max_participants: number;
  current_participants_count: number;
  organizer: {
    name: string;
    avatar_url?: string;
  };
  status: 'Open' | 'Full' | 'Completed';
  entry_mode: 'first-come' | 'application-based';
  cost?: number;
  equipment_required?: string;
  arrival_instructions?: string;
  event_participants: Array<{
    status: 'confirmed' | 'pending' | 'declined';
    profiles: {
      id: string;
      name: string;
      avatar_url?: string;
    };
  }>;
  activity_types: {
    name: string;
    icon: string;
    default_duration: number;
  };
  created_at: string;
}

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductReviewList from "./reviews";
import SubmitReviewForm from "./submit-review-form";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

// Mock data fetching function - replace with actual Supabase integration
async function getEventData(eventId: string): Promise<EventData> {
  try {
    // TODO: Replace with actual Supabase query
    // const { data: event, error } = await supabase
    //   .from('events')
    //   .select(`
    //     *,
    //     organizer:profiles(name, avatar_url),
    //     event_participants(
    //       status,
    //       profiles(id, name, avatar_url)
    //     ),
    //     activity_types(name, icon, default_duration)
    //   `)
    //   .eq('id', eventId)
    //   .single();
    //
    // if (error) {
    //   throw new Error(`Failed to fetch event: ${error.message}`);
    // }
    //
    // return event;
    
    // Mock data for development
  return {
    id: eventId,
    title: "Tuesday Evening Basketball - 5v5",
    description: "Join us for a competitive 5v5 basketball game at the local gym. All skill levels welcome, but intermediate level preferred. We'll split into teams based on experience.",
    date: "2025-01-15",
    time: "19:00",
    location_address: "123 Sports Center Dr",
    location_city: "San Francisco",
    location_zip: "94102",
    venue_name: "Downtown Sports Complex",
    activity_type: "Basketball",
    subcategory: "5v5",
    skill_level: "Intermediate",
    max_participants: 10,
    current_participants_count: 7,
    organizer: {
      name: "Alex Johnson",
      avatar_url: undefined
    },
    status: "Open",
    entry_mode: "first-come",
    cost: undefined,
    equipment_required: "Basketball shoes required",
    arrival_instructions: "Meet at the main entrance 10 minutes early",
    event_participants: [
      {
        status: "confirmed",
        profiles: {
          id: "1",
          name: "John Doe",
          avatar_url: undefined
        }
      },
      {
        status: "confirmed",
        profiles: {
          id: "2",
          name: "Jane Smith",
          avatar_url: undefined
        }
      },
      {
        status: "confirmed",
        profiles: {
          id: "3",
          name: "Mike Johnson",
          avatar_url: undefined
        }
      },
      {
        status: "confirmed",
        profiles: {
          id: "4",
          name: "Sarah Wilson",
          avatar_url: undefined
        }
      },
      {
        status: "confirmed",
        profiles: {
          id: "5",
          name: "Tom Brown",
          avatar_url: undefined
        }
      },
      {
        status: "confirmed",
        profiles: {
          id: "6",
          name: "Lisa Davis",
          avatar_url: undefined
        }
      },
      {
        status: "confirmed",
        profiles: {
          id: "7",
          name: "Chris Lee",
          avatar_url: undefined
        }
      }
    ],
    activity_types: {
      name: "Basketball",
      icon: "basketball",
      default_duration: 120
    },
    created_at: "2025-01-10T10:00:00Z"
  };
  } catch (error) {
    console.error('Error fetching event data:', error);
    throw new Error('Failed to load event data');
  }
}

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function getEventStatus(event: EventData): string {
  const participationRate = event.current_participants_count / event.max_participants;
  const eventDate = new Date(event.date);
  const now = new Date();
  
  if (eventDate < now) {
    return 'Completed';
  } else if (participationRate >= 1) {
    return 'Full';
  } else if (participationRate >= 0.75) {
    return 'Filling Fast';
  } else {
    return 'Open';
  }
}

function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'Open': return 'bg-green-100 text-green-800 border-green-200';
    case 'Filling Fast': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Full': return 'bg-red-100 text-red-800 border-red-200';
    case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

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
  
  let event: EventData;
  try {
    event = await getEventData(id);
  } catch (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Event Not Found</h2>
          <p className="text-muted-foreground mt-2">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  const eventStatus = getEventStatus(event);
  const statusBadgeColor = getStatusBadgeColor(eventStatus);
  const spotsAvailable = event.max_participants - event.current_participants_count;
  const confirmedParticipants = event.event_participants.filter(p => p.status === 'confirmed');
  const emptySpots = Math.max(0, event.max_participants - confirmedParticipants.length);
  return (
    <div className="space-y-4">
      <div className="flex flex-row items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl tracking-tight lg:text-2xl">{event.title}</h1>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeColor}`}>
              {eventStatus}
            </span>
          </div>
          <div className="text-muted-foreground inline-flex flex-col gap-2 text-sm lg:flex-row lg:gap-4">
            <div>
              <span className="text-foreground font-semibold">Organizer:</span> {event.organizer.name}
            </div>
            <div>
              <span className="text-foreground font-semibold">Created:</span> {formatDate(event.created_at)}
            </div>
            <div>
              <span className="text-foreground font-semibold">Event ID:</span> {event.id.slice(0, 8)}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Edit3Icon />
            <span className="hidden lg:inline">Edit</span>
          </Button>
          <Button variant="destructive" size="icon">
            <Trash2Icon />
          </Button>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-1">
          <EventMapLocation 
            address={event.location_address}
            city={event.location_city}
            zip={event.location_zip}
            venueName={event.venue_name}
          />
        </div>
        <div className="space-y-4 xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <Calendar className="size-6 opacity-40" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Date</span>
                <span className="text-lg font-semibold">{formatDate(event.date)}</span>
              </div>
            </div>
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <Clock className="size-6 opacity-40" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Time</span>
                <span className="text-lg font-semibold">{formatTime(event.time)}</span>
              </div>
            </div>
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <Users className="size-6 opacity-40" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Spots Available</span>
                <span className="text-lg font-semibold">{event.current_participants_count} of {event.max_participants}</span>
              </div>
            </div>
            <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
              <Trophy className="size-6 opacity-40" />
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm">Skill Level</span>
                <span className="text-lg font-semibold">{event.skill_level}</span>
              </div>
            </div>
          </div>
          <Card>
            <CardContent className="space-y-4">
              <div className="grid items-start gap-8 xl:grid-cols-3">
                <div className="space-y-8 xl:col-span-2">
                  <div>
                    <h3 className="mb-2 font-semibold">Description:</h3>
                    <p className="text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Location:</strong> {event.location_address}, {event.location_city}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Event Highlights:</h3>
                    <ul className="text-muted-foreground list-inside list-disc">
                      <li>Minimum {Math.ceil(event.max_participants / 2)} players required</li>
                      {event.equipment_required && <li>Equipment: {event.equipment_required}</li>}
                      <li>Cost: {event.cost ? `$${event.cost}` : 'Free'}</li>
                      {event.arrival_instructions && <li>Arrival: {event.arrival_instructions}</li>}
                    </ul>
                  </div>
                </div>
                <div className="rounded-md border xl:col-span-1">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-semibold">Sport Type</TableCell>
                        <TableCell className="text-right">{event.activity_type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Subcategory</TableCell>
                        <TableCell className="text-right">{event.subcategory}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Entry Mode</TableCell>
                        <TableCell className="text-right">{event.entry_mode === 'first-come' ? 'First-come' : 'Application-based'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-semibold">Skill Level</TableCell>
                        <TableCell className="text-right">{event.skill_level}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <div className="mb-4 font-semibold">Who&apos;s Coming ({confirmedParticipants.length}/{event.max_participants}):</div>
                  <div className="flex flex-wrap gap-2">
                    {confirmedParticipants.map((participant, index) => (
                      <div 
                        key={participant.profiles.id} 
                        className="group relative flex size-10 cursor-pointer items-center justify-center rounded-full border bg-muted hover:bg-muted/80"
                        title={participant.profiles.name}
                      >
                        {participant.profiles.avatar_url ? (
                          <img 
                            src={participant.profiles.avatar_url} 
                            alt={participant.profiles.name} 
                            className="size-full rounded-full object-cover" 
                          />
                        ) : (
                          <span className="text-xs font-medium">
                            {participant.profiles.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                          </span>
                        )}
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
                          {participant.profiles.name}
                        </div>
                      </div>
                    ))}
                    {Array(emptySpots).fill(0).map((_, i) => (
                      <div key={`empty-${i}`} className="flex size-10 items-center justify-center rounded-full border border-dashed bg-muted/50">
                        <span className="text-xs opacity-60">+</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  disabled={eventStatus === 'Full' || eventStatus === 'Completed'}
                  className={eventStatus === 'Full' || eventStatus === 'Completed' ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Users /> 
                  {eventStatus === 'Full' ? 'Event Full' : 
                   eventStatus === 'Completed' ? 'Event Ended' :
                   event.entry_mode === 'application-based' ? 'Request to Join' : 'Join Event'}
                </Button>
                <Button variant="outline">
                  <Share2 /> Share Event
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex-row justify-between">
              <CardTitle>Reviews</CardTitle>
              <CardAction>
                <SubmitReviewForm />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 xl:grid-cols-3">
                <div className="order-last lg:order-first xl:col-span-2">
                  <ProductReviewList />
                </div>
                <div className="order-first lg:order-last xl:col-span-1">
                  <div className="overflow-hidden rounded-lg border">
                    <div className="bg-muted flex items-center gap-4 p-4">
                      <div className="flex items-center gap-1">
                        <StarIcon className="size-4 fill-orange-400 stroke-orange-400" />
                        <StarIcon className="size-4 fill-orange-400 stroke-orange-400" />
                        <StarIcon className="size-4 fill-orange-400 stroke-orange-400" />
                        <StarIcon className="size-4 stroke-orange-400" />
                        <StarIcon className="size-4 stroke-orange-400" />
                      </div>
                      <span className="text-muted-foreground text-sm">4.3 (12 reviews)</span>
                    </div>
                    <div className="space-y-4 p-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">5 stars</span>
                        <Progress value={70} color="bg-orange-400" />
                        <span>70%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">4 stars</span>
                        <Progress value={17} color="bg-orange-600" />
                        <span>17%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">3 stars</span>
                        <Progress value={7} color="bg-yellow-300" />
                        <span>7%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">2 stars</span>
                        <Progress value={4} color="bg-yellow-600" />
                        <span>4%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="w-20">1 star</span>
                        <Progress value={2} color="bg-red-600" />
                        <span>2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
