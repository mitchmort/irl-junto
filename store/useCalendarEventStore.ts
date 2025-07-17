import { create, StateCreator } from "zustand";
import { EventInput } from "@fullcalendar/core";
import { supabase } from "@/lib/supabase/client";
import { Event, EventInsert, EventUpdate } from "@/types/database";
import { handleError } from "@/lib/error-handler";

// Convert Supabase event to FullCalendar EventInput
const convertToCalendarEvent = (event: Event): EventInput => {
  // Create end time from date, time, and duration
  const startDateTime = new Date(`${event.date}T${event.time || '09:00:00'}`);
  const endDateTime = new Date(startDateTime);
  
  // Parse duration if provided (e.g., "2 hours", "90 minutes")
  if (event.duration) {
    const durationMatch = event.duration.match(/(\d+)\s*(hour|minute|hr|min)/i);
    if (durationMatch) {
      const amount = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      
      if (unit.includes('hour') || unit.includes('hr')) {
        endDateTime.setHours(endDateTime.getHours() + amount);
      } else if (unit.includes('minute') || unit.includes('min')) {
        endDateTime.setMinutes(endDateTime.getMinutes() + amount);
      }
    } else {
      // Default to 2 hours if duration format isn't recognized
      endDateTime.setHours(endDateTime.getHours() + 2);
    }
  } else {
    // Default to 2 hours if no duration
    endDateTime.setHours(endDateTime.getHours() + 2);
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
  };
};

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
  };
  return colorMap[sport] || 'blue';
};

interface Store {
  events: EventInput[];
  selectedEvent: EventInput | null;
  openSheet: boolean;
  loading: boolean;
  error: string | null;
  // Preview modal state
  previewModalOpen: boolean;
  previewEvent: EventInput | null;
  // Details sheet state
  detailsSheetOpen: boolean;
  detailsSheetEvent: EventInput | null;
  // Event creation confirmation modal state
  createEventConfirmModalOpen: boolean;
  selectedDate: Date | null;
  
  // Actions
  fetchEvents: () => Promise<void>;
  addEvent: (event: EventInsert) => Promise<void>;
  updateEvent: (id: number, event: EventUpdate) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  setOpenSheet: (value: boolean) => void;
  setSelectedEvent: (event: EventInput | null) => void;
  clearError: () => void;
  // Preview modal actions
  setPreviewModalOpen: (open: boolean) => void;
  setPreviewEvent: (event: EventInput | null) => void;
  // Details sheet actions
  setDetailsSheetOpen: (open: boolean) => void;
  setDetailsSheetEvent: (event: EventInput | null) => void;
  // Event creation confirmation modal actions
  setCreateEventConfirmModalOpen: (open: boolean) => void;
  setSelectedDate: (date: Date | null) => void;
}

const calendarEventStore: StateCreator<Store> = (set, get) => ({
  events: [],
  selectedEvent: null,
  openSheet: false,
  loading: false,
  error: null,
  previewModalOpen: false,
  previewEvent: null,
  detailsSheetOpen: false,
  detailsSheetEvent: null,
  createEventConfirmModalOpen: false,
  selectedDate: null,

  fetchEvents: async () => {
    // Prevent multiple simultaneous fetch requests
    const currentState = get();
    if (currentState.loading) {
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Get current user to filter events
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ events: [], loading: false });
        return;
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
        .order('date', { ascending: true });

      if (error) throw error;

      // Filter to only events where user is organizer or participant
      const userEvents = (data || []).filter(event => {
        const isOrganizer = event.organizer === user.id;
        const isParticipant = event.event_participants?.some((p: any) => p.user_id === user.id);
        return isOrganizer || isParticipant;
      });

      const calendarEvents = userEvents.map(event => {
        // Calculate participant count from the relationship
        const participantCount = event.event_participants?.length || 0;
        return convertToCalendarEvent({
          ...event,
          participant_count: participantCount
        });
      });
      
      set({ events: calendarEvents, loading: false });
    } catch (error: any) {
      console.error('Calendar fetch error:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to load calendar events';
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Authentication error - please log in again';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      
      // Only call handleError for non-network errors to avoid spam
      if (!error.message?.includes('network') && !error.message?.includes('fetch')) {
        handleError(error);
      }
    }
  },

  addEvent: async (eventData: EventInsert) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      const calendarEvent = convertToCalendarEvent(data);
      set((state) => ({ 
        events: [...state.events, calendarEvent],
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleError(error);
    }
  },

  updateEvent: async (id: number, eventData: EventUpdate) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const calendarEvent = convertToCalendarEvent(data);
      set((state) => ({ 
        events: state.events.map(event => 
          event.id === id.toString() ? calendarEvent : event
        ),
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleError(error);
    }
  },

  deleteEvent: async (id: number) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({ 
        events: state.events.filter(event => event.id !== id.toString()),
        loading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      handleError(error);
    }
  },

  setOpenSheet: (value) => {
    if (!value) {
      setTimeout(() => {
        set({ selectedEvent: null });
      }, 500);
    }
    set({ openSheet: value });
  },

  setSelectedEvent: (event) => set(() => ({ selectedEvent: event })),
  
  clearError: () => set({ error: null }),
  
  setPreviewModalOpen: (open) => {
    if (!open) {
      setTimeout(() => {
        set({ previewEvent: null });
      }, 300);
    }
    set({ previewModalOpen: open });
  },
  
  setPreviewEvent: (event) => set({ previewEvent: event }),
  
  setDetailsSheetOpen: (open) => {
    if (!open) {
      setTimeout(() => {
        set({ detailsSheetEvent: null });
      }, 300);
    }
    set({ detailsSheetOpen: open });
  },
  
  setDetailsSheetEvent: (event) => set({ detailsSheetEvent: event }),
  
  setCreateEventConfirmModalOpen: (open) => {
    if (!open) {
      setTimeout(() => {
        set({ selectedDate: null });
      }, 300);
    }
    set({ createEventConfirmModalOpen: open });
  },
  
  setSelectedDate: (date) => set({ selectedDate: date })
});

const useCalendarEventStore = create(calendarEventStore);

export default useCalendarEventStore;
