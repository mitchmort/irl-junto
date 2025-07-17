import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { type User } from '@supabase/supabase-js'
import { type Tables } from '@/lib/supabase/utils'

type CustomUser = Tables<'users'>

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [customUser, setCustomUser] = useState<CustomUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to fetch custom user data
  const fetchCustomUser = async (userId: string): Promise<CustomUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching custom user:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error fetching custom user:', error)
      return null
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const customUserData = await fetchCustomUser(session.user.id)
        setCustomUser(customUserData)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const customUserData = await fetchCustomUser(session.user.id)
          setCustomUser(customUserData)
        } else {
          setCustomUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: { full_name: string }) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })

      if (error) throw error

      return data
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/reset-password`,
      })

      if (error) throw error

      return true
    } catch (error: any) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      
      if (updateError) throw updateError
      
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signInWithPhone = async (phone: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithOtp({
        phone
      })
      
      if (signInError) throw signInError
      
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (phone: string, otp: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      })
      
      if (verifyError) throw verifyError
      
      // After successful OTP verification, fetch or create the custom user record
      if (data?.user) {
        let customUserData = await fetchCustomUser(data.user.id)
        
        // If no custom user exists, create one with phone data
        if (!customUserData) {
          // Check if we have a pending name from registration
          let userName = 'User'
          if (typeof window !== 'undefined') {
            userName = sessionStorage.getItem('pending_user_name') || 'User'
            // Clean up session storage
            sessionStorage.removeItem('pending_user_name')
            sessionStorage.removeItem('pending_user_phone')
          }
          
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              phone_number: phone,
              phone_verified: true,
              name: userName,
              created_at: new Date().toISOString(),
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Error creating custom user:', createError)
          } else {
            customUserData = newUser
          }
        }
        
        setCustomUser(customUserData)
        
        // Ensure the user state is also properly set
        setUser(data.user)
      }
      
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const registerWithPhone = async (phone: string, name: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // First send OTP using Supabase
      const { data, error: signInError } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true
        }
      })
      
      if (signInError) throw signInError
      
      // Store the name temporarily for after verification
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_user_name', name)
        sessionStorage.setItem('pending_user_phone', phone)
      }
      
      return data
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    customUser,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithPhone,
    verifyOtp,
    registerWithPhone,
    isAuthenticated: !!user,
    isPhoneVerified: !!customUser?.phone_verified
  }
} 