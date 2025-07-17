'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>('Testing Supabase connection...')
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Supabase client exists:', !!supabase)
        
        // Test a simple query
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Supabase error:', error)
          setError(error.message)
          setStatus('Error connecting to Supabase')
        } else {
          console.log('Supabase session data:', data)
          setStatus('Connected to Supabase successfully!')
        }
      } catch (err: any) {
        console.error('Unexpected error:', err)
        setError(err.message || 'Unknown error')
        setStatus('Failed to connect to Supabase')
      }
    }
    
    testConnection()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="space-y-2">
        <p>Status: {status}</p>
        {error && <p className="text-red-500">Error: {error}</p>}
        <div className="mt-4 text-sm text-gray-600">
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
          <p>Has Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}