import { supabase } from './client'
import { Database } from '@/types/database'

// Helper types
export type SupabaseClient = typeof supabase
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Error handling utility
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error?.message) {
    throw new Error(error.message)
  }
  
  throw new Error('An unexpected error occurred')
}

// Generic query wrapper with error handling
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> => {
  try {
    const { data, error } = await queryFn()
    
    if (error) {
      handleSupabaseError(error)
    }
    
    if (!data) {
      throw new Error('No data returned from query')
    }
    
    return data
  } catch (error) {
    handleSupabaseError(error)
    throw error // This will never be reached, but TypeScript needs it
  }
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}

// Get current user profile
export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  return safeQuery(async () => 
    await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
  )
}

// Database connection test
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .select('count')
      .limit(1)
    
    return !error
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
} 