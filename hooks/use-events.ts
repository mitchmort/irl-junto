import { useState, useEffect } from 'react'
import { supabase, Event, EventInsert, EventUpdate } from '@/lib/supabase'

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
      
      if (fetchError) throw fetchError
      setEvents(data || [])
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
  }, [])

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

export const useEvent = (id: number) => {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = async () => {
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