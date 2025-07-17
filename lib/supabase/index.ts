// Client-side Supabase client
export { createClient as supabase } from './client'
export * from './server'
export * from './storage'

// Utility functions
export {
  handleSupabaseError,
  safeQuery,
  isAuthenticated,
  getCurrentProfile,
  testDatabaseConnection,
  type SupabaseClient,
  type Tables,
  type Enums
} from './utils'

// Re-export types for convenience
export type {
  Database,
  Event,
  EventInsert,
  EventUpdate,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  ActivityType,
  ActivityTypeInsert,
  ActivityTypeUpdate,
  EventParticipant,
  EventParticipantInsert,
  EventParticipantUpdate,
  EventParticipantWithProfile,
  User,
  UserInsert,
  UserUpdate,
  DashboardKPIs
} from '@/types/database' 