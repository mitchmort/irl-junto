'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function TestNoSessionPage() {
  const [result, setResult] = useState<any>({ testing: true })
  
  useEffect(() => {
    try {
      console.log('Test 1: Environment variables')
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('URL:', url)
      console.log('Key exists:', !!key)
      console.log('Key length:', key?.length)
      
      console.log('Test 2: Creating client')
      const client = createBrowserClient(url!, key!)
      console.log('Client created successfully:', !!client)
      console.log('Client auth object:', !!client.auth)
      
      // Try to access other properties without calling getSession
      console.log('Client storage:', !!client.storage)
      console.log('Client functions:', !!client.functions)
      
      setResult({
        success: true,
        url: url,
        keyExists: !!key,
        keyLength: key?.length,
        clientCreated: true,
        hasAuth: !!client.auth,
        hasStorage: !!client.storage,
        hasFunctions: !!client.functions
      })
      
      console.log('All tests completed without calling getSession')
    } catch (err: any) {
      console.error('Error:', err)
      setResult({ 
        error: err.message,
        stack: err.stack
      })
    }
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Without getSession</h1>
      <p className="mb-4">This test creates a Supabase client but doesn't call getSession</p>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}