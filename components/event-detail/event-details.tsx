"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  DollarSign,
  Package,
  Navigation,
  Eye,
  EyeOff
} from "lucide-react";
import { EventPermissions } from "@/hooks/use-event-permissions";
import { EditableField } from "@/components/event-edit/editable-field";
import { EditableDate } from "@/components/event-edit/editable-date";
import { EditableTime } from "@/components/event-edit/editable-time";
import { EditableSelect } from "@/components/event-edit/editable-select";

interface EventDetailsProps {
  event: {
    id: number;
    title: string;
    description: string | null;
    date: string;
    time: string;
    location: string;
    sport: string;
    sub_type?: string | null;
    skill_levels: any;
    max_participants: number;
    participant_count: number;
    cost?: number | null;
    equipment_requirements?: string | null;
    arrival_instructions?: string | null;
    organizer?: string | null;
  };
  permissions: EventPermissions;
  editMode?: boolean;
}

export function EventDetails({ event, permissions, editMode = false }: EventDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };


  const getSkillLevel = () => {
    try {
      const skillLevels = JSON.parse(event.skill_levels);
      return Array.isArray(skillLevels) ? skillLevels[0] : skillLevels;
    } catch {
      return event.skill_levels || 'All levels';
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Basic Event Info Cards */}
      <div className="grid gap-1.5 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-2 py-2 gap-1">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              {editMode ? (
                <EditableDate
                  fieldName="date"
                  value={event.date}
                  className="font-semibold"
                  onValidate={(value) => {
                    const date = new Date(value);
                    if (date < new Date()) {
                      return "Event date cannot be in the past";
                    }
                    return null;
                  }}
                />
              ) : (
                <p className="font-semibold">{formatDate(event.date)}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-2 py-2 gap-1">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              {editMode ? (
                <EditableTime
                  fieldName="time"
                  value={event.time}
                  className="font-semibold"
                />
              ) : (
                <p className="font-semibold">{formatTime(event.time)}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-2 py-2 gap-1">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Players</p>
              {editMode ? (
                <div className="font-semibold">
                  {event.participant_count} / <EditableField
                    fieldName="max_participants"
                    value={event.max_participants}
                    type="number"
                    className="inline-block w-16"
                    onValidate={(value) => {
                      const num = Number(value);
                      if (num < event.participant_count) {
                        return "Cannot be less than current participant count";
                      }
                      if (num < 1) {
                        return "Must be at least 1";
                      }
                      return null;
                    }}
                    min={event.participant_count}
                    max={100}
                  />
                </div>
              ) : (
                <p className="font-semibold">
                  {event.participant_count} / {event.max_participants}
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-2 py-2 gap-1">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Skill Level</p>
              <p className="font-semibold capitalize">{getSkillLevel()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Event Description */}
      <Card className="py-2 gap-2">
        <CardContent className="p-3">
          <h3 className="font-semibold mb-2">About This Event</h3>
          {editMode ? (
            <EditableField
              fieldName="description"
              value={event.description || ''}
              type="textarea"
              placeholder="Describe your event..."
              className="text-muted-foreground leading-relaxed"
              displayValue={event.description || 'No description provided for this event.'}
              maxLength={500}
            />
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              {event.description || 'No description provided for this event.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Event Details */}
      <Card className="py-2 gap-2">
        <CardContent className="p-3">
          <h3 className="font-semibold mb-2">Event Details</h3>
          <div className="grid gap-1.5 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Sport</p>
                <p className="font-medium">{event.sport}</p>
              </div>
            </div>

            {event.sub_type && (
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="font-medium">{event.sub_type}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cost</p>
                {editMode ? (
                  <div className="font-medium">
                    <EditableField
                      fieldName="cost"
                      value={event.cost || 0}
                      type="number"
                      className="inline-block w-20"
                      displayValue={event.cost ? `$${event.cost} per person` : 'Free'}
                      onValidate={(value) => {
                        const num = Number(value);
                        if (num < 0) {
                          return "Cost cannot be negative";
                        }
                        return null;
                      }}
                      min={0}
                      max={500}
                    />
                  </div>
                ) : (
                  <p className="font-medium">
                    {event.cost ? `$${event.cost} per person` : 'Free'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Private Details (Only for participants and organizer) */}
      {permissions.canSeePrivateDetails && (event.equipment_requirements || event.arrival_instructions) && (
        <Card className="py-2 gap-2">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold">Participant Information</h3>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Participants Only
              </Badge>
            </div>
            
            <div className="space-y-2">
              {(event.equipment_requirements || editMode) && (
                <div className="flex items-start gap-2.5">
                  <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Equipment Needed</h4>
                    {editMode ? (
                      <EditableField
                        fieldName="equipment_requirements"
                        value={event.equipment_requirements || ''}
                        type="textarea"
                        placeholder="List required equipment..."
                        className="text-muted-foreground text-sm"
                        displayValue={event.equipment_requirements || 'No equipment requirements specified.'}
                        maxLength={200}
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {event.equipment_requirements}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(event.arrival_instructions || editMode) && (
                <div className="flex items-start gap-2.5">
                  <Navigation className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Arrival Instructions</h4>
                    {editMode ? (
                      <EditableField
                        fieldName="arrival_instructions"
                        value={event.arrival_instructions || ''}
                        type="textarea"
                        placeholder="Provide arrival instructions..."
                        className="text-muted-foreground text-sm"
                        displayValue={event.arrival_instructions || 'No arrival instructions specified.'}
                        maxLength={200}
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {event.arrival_instructions}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Details Notice for Non-Participants */}
      {!permissions.canSeePrivateDetails && permissions.isAuthenticated && !permissions.isParticipant && (
        <Card className="border-dashed py-2 gap-2">
          <CardContent className="p-3 text-center">
            <EyeOff className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-medium mb-2">Additional Details Available</h3>
            <p className="text-sm text-muted-foreground">
              Join this event to see equipment requirements, arrival instructions, and other participant details.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}