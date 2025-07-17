'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { type Tables } from '@/lib/supabase/utils'

type Profile = Tables<'profiles'>
type CustomUser = Tables<'users'>

interface AuthContextType {
  user: User | null
  profile: Profile | null
  customUser: CustomUser | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshCustomUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Legacy export for backward compatibility
export const useAuth = useAuthContext

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('AuthProvider: Component mounting')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [customUser, setCustomUser] = useState<CustomUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
        return
      }
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  const fetchCustomUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching custom user:', error)
        setCustomUser(null)
        return
      }
      setCustomUser(data)
    } catch (error) {
      console.error('Error fetching custom user:', error)
      setCustomUser(null)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const refreshCustomUser = async () => {
    if (user) {
      await fetchCustomUser(user.id)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      console.log('AuthProvider: Starting auth initialization...')
      
      // Set loading to false immediately for now to avoid the infinite loading
      // We'll rely on the middleware for auth checks
      setLoading(false)
      
      try {
        // Try to get the user without getSession which seems to hang
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (!mounted) {
          console.log('AuthProvider: Component unmounted, aborting')
          return
        }
        
        if (error) {
          console.log('No authenticated user found:', error.message)
          setUser(null)
          setProfile(null)
          setCustomUser(null)
          return
        }

        console.log('User retrieved:', user?.id ? `User: ${user.id}` : 'No user')
        setUser(user ?? null)
        
        if (user) {
          await Promise.all([
            fetchProfile(user.id),
            fetchCustomUser(user.id)
          ])
        }
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error)
        // Clear state on any unexpected error
        setUser(null)
        setProfile(null)
        setCustomUser(null)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        
        try {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await Promise.all([
              fetchProfile(session.user.id),
              fetchCustomUser(session.user.id)
            ])
          } else {
            setProfile(null)
            setCustomUser(null)
          }
        } catch (error) {
          console.error('Error handling auth state change:', error)
          // On error, clear state but don't hang
          setUser(null)
          setProfile(null)
          setCustomUser(null)
        } finally {
          // Always resolve loading state
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    profile,
    customUser,
    loading,
    signOut,
    refreshProfile,
    refreshCustomUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 