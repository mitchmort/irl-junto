import { useState, useEffect } from 'react'
import { supabase, ActivityType } from '@/lib/supabase'

export const useActivityTypes = () => {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivityTypes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('activity_types')
        .select('*')
        .order('name', { ascending: true })
      
      if (fetchError) throw fetchError
      setActivityTypes(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityTypes()
  }, [])

  return {
    activityTypes,
    loading,
    error,
    refetch: fetchActivityTypes
  }
}

export const useActivityType = (id: string) => {
  const [activityType, setActivityType] = useState<ActivityType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActivityType = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('activity_types')
        .select('*')
        .eq('id', id)
        .single()
      
      if (fetchError) throw fetchError
      setActivityType(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchActivityType()
    }
  }, [id])

  return {
    activityType,
    loading,
    error,
    refetch: fetchActivityType
  }
} 