'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function TestMinimalPage() {
  const [result, setResult] = useState<any>({ loading: true })
  
  useEffect(() => {
    const test = async () => {
      try {
        console.log('Creating Supabase client directly...')
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        console.log('URL exists:', !!url)
        console.log('Key exists:', !!key)
        
        if (!url || !key) {
          setResult({ error: 'Missing environment variables', url: !!url, key: !!key })
          return
        }
        
        const client = createBrowserClient(url, key)
        console.log('Client created:', !!client)
        
        const { data, error } = await client.auth.getSession()
        console.log('Session result:', { data, error })
        
        setResult({ 
          success: true, 
          session: data?.session, 
          error: error?.message,
          clientCreated: true 
        })
      } catch (err: any) {
        console.error('Test error:', err)
        setResult({ 
          error: err.message || 'Unknown error',
          stack: err.stack
        })
      }
    }
    
    test()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Minimal Supabase Test</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}