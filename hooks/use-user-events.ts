import { useQuery } from '@tanstack/react-query'
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
  page?: number
  limit?: number
  search?: string
}

const getEventStatus = (event: UserEvent): 'upcoming' | 'completed' | 'cancelled' => {
  if (event.status === 'cancelled') return 'cancelled'
  
  const eventDate = new Date(event.date)
  const now = new Date()
  
  if (eventDate < now) return 'completed'
  return 'upcoming'
}

const fetchUserEvents = async (filters: UserEventFilters = { type: 'all' }): Promise<{ events: UserEvent[], totalCount: number }> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { events: [], totalCount: 0 }
  }

  // For better performance, we'll implement database-level filtering where possible
  // and minimal client-side processing
  let query = supabase
    .from('events')
    .select(`
      *,
      event_participants!left(
        user_id,
        status,
        role
      )
    `, { count: 'exact' })
    .order('date', { ascending: false })

  // Apply search filter at database level
  if (filters.search && filters.search.trim()) {
    query = query.ilike('title', `%${filters.search.trim()}%`)
  }

  // Apply date range filter at database level
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

  // Apply basic user relationship filter at database level for better performance
  switch (filters.type) {
    case 'organized':
      query = query.eq('organizer', user.id)
      break
    case 'joined':
      // For joined events, we need events where user is a participant
      query = query.eq('event_participants.user_id', user.id)
      break
    case 'available':
      // For available events, exclude user's own events and current participations
      query = query
        .neq('organizer', user.id)
        .gte('date', new Date().toISOString().split('T')[0])
      break
    // For 'all', we don't apply specific filters at database level
  }

  const { data, error: fetchError, count } = await query

  if (fetchError) throw fetchError

  // Transform events with user role information
  const allUserEvents: UserEvent[] = (data || []).map(event => {
    const userParticipation = event.event_participants?.find((p: any) => p.user_id === user.id)
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
      participant_count: event.event_participants?.length || 0
    }
  })

  // Apply remaining client-side filters (for complex logic not easily done in SQL)
  let filteredEvents = allUserEvents

  // Apply additional filtering for 'all' and 'available' types
  if (filters.type === 'all') {
    filteredEvents = allUserEvents.filter(event => event.user_role !== null)
  } else if (filters.type === 'available') {
    filteredEvents = allUserEvents.filter(event => 
      event.user_role === null && 
      event.participant_count < event.max_participants
    )
  }

  // Apply status filter
  if (filters.status && filters.status.length > 0) {
    filteredEvents = filteredEvents.filter(event => {
      const eventStatus = getEventStatus(event)
      return filters.status!.includes(eventStatus)
    })
  }

  // Apply pagination to filtered results
  const page = filters.page || 1
  const limit = filters.limit || 20
  const offset = (page - 1) * limit
  const totalFilteredCount = filteredEvents.length
  const paginatedEvents = filteredEvents.slice(offset, offset + limit)

  return {
    events: paginatedEvents,
    totalCount: totalFilteredCount
  }
}

export const useUserEvents = (filters: UserEventFilters = { type: 'all' }) => {
  const queryKey = ['user-events', filters]
  
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => fetchUserEvents(filters),
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

  const events = data?.events || []
  const totalCount = data?.totalCount || 0

  const getEventStats = (events: UserEvent[]) => {
    const now = new Date()
    const currentWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const totalEvents = totalCount
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

  return {
    events,
    loading: isLoading,
    error: error?.message || null,
    getEventStats,
    refetch,
    totalCount,
    hasNextPage: events.length === (filters.limit || 20),
    hasPreviousPage: (filters.page || 1) > 1
  }
}