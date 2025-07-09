import { useState, useEffect } from 'react'
import { supabase, Event } from '@/lib/supabase'

export interface UserEvent extends Event {
  user_role: 'organizer' | 'participant' | null
  participant_count: number
  participant_status?: 'attending' | 'pending' | 'declined'
}

export interface UserEventFilters {
  type: 'all' | 'organized' | 'joined' | 'available'
  status?: ('upcoming' | 'completed' | 'cancelled')[]
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'future'
}

export const useUserEvents = (filters: UserEventFilters = { type: 'all' }) => {
  const [events, setEvents] = useState<UserEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserEvents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setEvents([])
        return
      }

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

      // Apply date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date()
        let startDate: Date
        let endDate: Date | null = null

        switch (filters.dateRange) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
            break
          case 'week':
            startDate = new Date(now)
            startDate.setDate(now.getDate() - now.getDay())
            endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
            break
          case 'future':
            startDate = now
            break
          default:
            startDate = new Date(0)
        }

        query = query.gte('date', startDate.toISOString().split('T')[0])
        if (endDate) {
          query = query.lt('date', endDate.toISOString().split('T')[0])
        }
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Transform events with user role information
      const userEvents: UserEvent[] = (data || []).map(event => {
        const userParticipation = event.participants?.find(p => p.user_id === user.id)
        const isOrganizer = event.organizer === user.id
        
        let user_role: 'organizer' | 'participant' | null = null
        let participant_status: 'attending' | 'pending' | 'declined' | undefined = undefined

        if (isOrganizer) {
          user_role = 'organizer'
        } else if (userParticipation) {
          user_role = 'participant'
          participant_status = userParticipation.status as 'attending' | 'pending' | 'declined'
        }

        return {
          ...event,
          user_role,
          participant_status,
          participant_count: event.participants?.length || 0
        }
      })

      // Apply user-specific filters
      let filteredEvents = userEvents

      switch (filters.type) {
        case 'organized':
          filteredEvents = userEvents.filter(event => event.user_role === 'organizer')
          break
        case 'joined':
          filteredEvents = userEvents.filter(event => event.user_role === 'participant')
          break
        case 'available':
          filteredEvents = userEvents.filter(event => 
            event.user_role === null && 
            event.participant_count < event.max_participants &&
            new Date(event.date) > new Date()
          )
          break
        case 'all':
        default:
          filteredEvents = userEvents.filter(event => event.user_role !== null)
          break
      }

      // Apply status filter
      if (filters.status && filters.status.length > 0) {
        filteredEvents = filteredEvents.filter(event => {
          const eventStatus = getEventStatus(event)
          return filters.status!.includes(eventStatus)
        })
      }

      setEvents(filteredEvents)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getEventStatus = (event: UserEvent): 'upcoming' | 'completed' | 'cancelled' => {
    if (event.status === 'cancelled') return 'cancelled'
    
    const eventDate = new Date(event.date)
    const now = new Date()
    
    if (eventDate < now) return 'completed'
    return 'upcoming'
  }

  const getEventStats = (events: UserEvent[]) => {
    const now = new Date()
    const currentWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const totalEvents = events.length
    const upcomingEvents = events.filter(event => 
      new Date(event.date) > now && getEventStatus(event) !== 'cancelled'
    ).length
    const organizedEvents = events.filter(event => 
      event.user_role === 'organizer'
    ).length
    const thisWeekEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate >= currentWeek && eventDate <= now
    }).length

    return {
      totalEvents,
      upcomingEvents,
      organizedEvents,
      thisWeekEvents
    }
  }

  useEffect(() => {
    fetchUserEvents()
  }, [filters.type, filters.status, filters.dateRange])

  return {
    events,
    loading,
    error,
    fetchUserEvents,
    getEventStats,
    refetch: fetchUserEvents
  }
}