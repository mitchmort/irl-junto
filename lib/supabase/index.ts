// Client-side Supabase client
export { supabase, createClient as createBrowserClient } from './client'

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
  User,
  UserInsert,
  UserUpdate,
  DashboardKPIs
} from '@/types/database' 