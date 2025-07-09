import { useState, useEffect } from 'react'
import { supabase, Event, EventInsert, EventUpdate } from '@/lib/supabase'

export interface EventsFilters {
  userOnly?: boolean
  organizerOnly?: boolean
  participantOnly?: boolean
  includeParticipantCount?: boolean
}

export const useEvents = (filters: EventsFilters = {}) => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let query = supabase
        .from('events')
        .select(`
          *,
          participants:event_participants(
            user_id,
            status,
            role,
            created_at
          )
        `)
        .order('date', { ascending: true })

      // Apply user-specific filters
      if (filters.userOnly && user) {
        // Get events where user is either organizer or participant
        query = query.or(`organizer.eq.${user.id},participants.user_id.eq.${user.id}`)
      }

      if (filters.organizerOnly && user) {
        query = query.eq('organizer', user.id)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      let processedEvents = data || []

      // Additional filtering for participant-only events
      if (filters.participantOnly && user) {
        processedEvents = processedEvents.filter(event => 
          event.participants?.some(p => p.user_id === user.id)
        )
      }

      // Add participant count if requested
      if (filters.includeParticipantCount) {
        processedEvents = processedEvents.map(event => ({
          ...event,
          participant_count: event.participants?.length || 0
        }))
      }

      setEvents(processedEvents)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: EventInsert): Promise<Event | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: createError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()
      
      if (createError) throw createError
      
      // Update local state
      if (data) {
        setEvents(prev => [...prev, data])
      }
      
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateEvent = async (id: number, updates: EventUpdate): Promise<Event | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: updateError } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      // Update local state
      if (data) {
        setEvents(prev => prev.map(event => event.id === id ? data : event))
      }
      
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      
      if (deleteError) throw deleteError
      
      // Update local state
      setEvents(prev => prev.filter(event => event.id !== id))
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [filters.userOnly, filters.organizerOnly, filters.participantOnly, filters.includeParticipantCount])

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  }
}

export const useEvent = (id?: number) => {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = async () => {
    if (!id) return;
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          organizer_profile:profiles!events_organizer_fkey(*),
          participants:event_participants(
            *,
            profile:profiles(*)
          )
        `)
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      setEvent(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchEvent()
    }
  }, [id])

  return {
    event,
    loading,
    error,
    refetch: fetchEvent
  }
}

export const useEventBySlug = (slug?: string) => {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = async () => {
    if (!slug) return;
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select(`
          *,
          organizer_profile:profiles!events_organizer_fkey(*),
          participants:event_participants(
            *,
            profile:profiles(*)
          )
        `)
        .eq('url_slug', slug)
        .single()
      
      if (fetchError) throw fetchError
      setEvent(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      fetchEvent()
    }
  }, [slug])

  return {
    event,
    loading,
    error,
    refetch: fetchEvent
  }
} 