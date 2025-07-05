import { useState, useEffect } from 'react'
import { supabase, EventParticipant, EventParticipantInsert, EventParticipantUpdate } from '@/lib/supabase'

export const useEventParticipants = (eventId: number) => {
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchParticipants = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('event_participants')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })
      
      if (fetchError) throw fetchError
      setParticipants(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const joinEvent = async (participantData?: Partial<EventParticipantInsert>): Promise<EventParticipant | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const insertData: EventParticipantInsert = {
        event_id: eventId,
        user_id: user.id,
        status: 'attending',
        role: 'participant',
        ...participantData
      }
      
      const { data, error: joinError } = await supabase
        .from('event_participants')
        .insert(insertData)
        .select(`
          *,
          profile:profiles(*)
        `)
        .single()
      
      if (joinError) throw joinError
      
      // Update local state
      if (data) {
        setParticipants(prev => [...prev, data])
      }
      
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const leaveEvent = async (): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { error: leaveError } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id)
      
      if (leaveError) throw leaveError
      
      // Update local state
      setParticipants(prev => prev.filter(p => p.user_id !== user.id))
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateParticipantStatus = async (
    userId: string, 
    updates: EventParticipantUpdate
  ): Promise<EventParticipant | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: updateError } = await supabase
        .from('event_participants')
        .update(updates)
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .select(`
          *,
          profile:profiles(*)
        `)
        .single()
      
      if (updateError) throw updateError
      
      // Update local state
      if (data) {
        setParticipants(prev => 
          prev.map(p => p.user_id === userId ? data : p)
        )
      }
      
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const removeParticipant = async (userId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: removeError } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)
      
      if (removeError) throw removeError
      
      // Update local state
      setParticipants(prev => prev.filter(p => p.user_id !== userId))
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const checkUserParticipation = async (): Promise<EventParticipant | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const { data, error } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
      return data || null
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchParticipants()
    }
  }, [eventId])

  return {
    participants,
    loading,
    error,
    joinEvent,
    leaveEvent,
    updateParticipantStatus,
    removeParticipant,
    checkUserParticipation,
    refetch: fetchParticipants
  }
} 