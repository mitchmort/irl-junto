import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { type User } from '@supabase/supabase-js'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
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
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithPhone,
    verifyOtp,
    isAuthenticated: !!user
  }
} 