import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabaseClient
}

// Create a singleton client instance
export const supabase = createClient() 