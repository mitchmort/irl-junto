import { useState, useEffect } from 'react'
import { supabase, Profile, ProfileInsert, ProfileUpdate } from '@/lib/supabase'

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (id?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      let query = supabase.from('profiles').select('*')
      
      if (id) {
        query = query.eq('id', id)
      } else {
        // Get current user's profile
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        query = query.eq('id', user.id)
      }
      
      const { data, error: fetchError } = await query.single()
      
      if (fetchError) throw fetchError
      setProfile(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: ProfileUpdate): Promise<Profile | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId || user.id)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      setProfile(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (profileData: ProfileInsert): Promise<Profile | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: createError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()
      
      if (createError) throw createError
      
      setProfile(data)
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile(userId)
  }, [userId])

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
    refetch: () => fetchProfile(userId)
  }
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfiles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })
      
      if (fetchError) throw fetchError
      setProfiles(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles
  }
} 