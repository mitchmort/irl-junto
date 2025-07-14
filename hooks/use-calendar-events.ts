import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EventInput } from "@fullcalendar/core"
import { supabase } from "@/lib/supabase"
import { Event, EventInsert, EventUpdate } from "@/types/database"
import { handleError } from "@/lib/error-handler"

// Convert Supabase event to FullCalendar EventInput
const convertToCalendarEvent = (event: Event): EventInput => {
  // Create end time from date, time, and duration
  const startDateTime = new Date(`${event.date}T${event.time || '09:00:00'}`)
  const endDateTime = new Date(startDateTime)
  
  // Parse duration if provided (e.g., "2 hours", "90 minutes")
  if (event.duration) {
    const durationMatch = event.duration.match(/(\d+)\s*(hour|minute|hr|min)/i)
    if (durationMatch) {
      const amount = parseInt(durationMatch[1])
      const unit = durationMatch[2].toLowerCase()
      
      if (unit.includes('hour') || unit.includes('hr')) {
        endDateTime.setHours(endDateTime.getHours() + amount)
      } else if (unit.includes('minute') || unit.includes('min')) {
        endDateTime.setMinutes(endDateTime.getMinutes() + amount)
      }
    } else {
      // Default to 2 hours if duration format isn't recognized
      endDateTime.setHours(endDateTime.getHours() + 2)
    }
  } else {
    // Default to 2 hours if no duration
    endDateTime.setHours(endDateTime.getHours() + 2)
  }

  return {
    id: event.id.toString(),
    title: event.title,
    start: startDateTime.toISOString(),
    end: endDateTime.toISOString(),
    description: event.description || '',
    color: getEventColor(event.sport),
    extendedProps: {
      sport: event.sport,
      sub_type: event.sub_type,
      location: event.location,
      max_participants: event.max_participants,
      participant_count: event.participant_count,
      organizer: event.organizer,
      status: event.status,
      cost: event.cost,
      skill_levels: event.skill_levels,
      notes: event.notes,
      duration: event.duration,
      equipment_requirements: event.equipment_requirements,
      arrival_instructions: event.arrival_instructions,
      share_link: event.share_link,
      created_at: event.created_at,
      url_slug: event.url_slug
    }
  }
}

// Map sports to colors
const getEventColor = (sport: string): string => {
  const colorMap: Record<string, string> = {
    'Basketball': 'orange',
    'Tennis': 'green',
    'Pickleball': 'purple',
    'Volleyball': 'blue',
    'Soccer': 'red',
    'Baseball': 'teal',
    'Football': 'orange',
    'Golf': 'green',
    'Badminton': 'purple',
    'Squash': 'blue',
    'Table Tennis': 'red',
    'Swimming': 'teal'
  }
  return colorMap[sport] || 'blue'
}

// Fetch calendar events function
const fetchCalendarEvents = async (): Promise<EventInput[]> => {
  // Get current user to filter events
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  // Simple query - fetch all events with participants, then filter client-side
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_participants(
        user_id,
        status,
        role
      )
    `)
    .order('date', { ascending: true })

  if (error) throw error

  // Filter to only events where user is organizer or participant
  const userEvents = (data || []).filter(event => {
    const isOrganizer = event.organizer === user.id
    const isParticipant = event.event_participants?.some((p: any) => p.user_id === user.id)
    return isOrganizer || isParticipant
  })

  const calendarEvents = userEvents.map(event => {
    // Calculate participant count from the relationship
    const participantCount = event.event_participants?.length || 0
    return convertToCalendarEvent({
      ...event,
      participant_count: participantCount
    })
  })
  
  return calendarEvents
}

// React Query hook for calendar events
export const useCalendarEvents = () => {
  const queryClient = useQueryClient()

  const {
    data: events = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: fetchCalendarEvents,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('4')) {
        return false
      }
      return failureCount < 2
    }
  })

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (eventData: EventInsert) => {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      const calendarEvent = convertToCalendarEvent(data)
      queryClient.setQueryData(['calendar-events'], (old: EventInput[] = []) => 
        [...old, calendarEvent]
      )
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
    onError: (error) => {
      handleError(error)
    }
  })

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, eventData }: { id: number, eventData: EventUpdate }) => {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      const calendarEvent = convertToCalendarEvent(data)
      queryClient.setQueryData(['calendar-events'], (old: EventInput[] = []) => 
        old.map(event => event.id === data.id.toString() ? calendarEvent : event)
      )
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
    onError: (error) => {
      handleError(error)
    }
  })

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: (id) => {
      queryClient.setQueryData(['calendar-events'], (old: EventInput[] = []) => 
        old.filter(event => event.id !== id.toString())
      )
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
    onError: (error) => {
      handleError(error)
    }
  })

  return {
    events,
    loading,
    error: error?.message || null,
    refetch,
    addEvent: addEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isAddingEvent: addEventMutation.isPending,
    isUpdatingEvent: updateEventMutation.isPending,
    isDeletingEvent: deleteEventMutation.isPending
  }
}