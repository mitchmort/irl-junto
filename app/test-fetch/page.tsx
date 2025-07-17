'use client'

import { useEffect, useState } from 'react'

export default function TestFetchPage() {
  const [result, setResult] = useState<any>({ loading: true })
  
  useEffect(() => {
    const test = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        
        if (!url) {
          setResult({ error: 'No Supabase URL' })
          return
        }
        
        // Try a direct fetch to the Supabase auth endpoint
        console.log('Fetching:', `${url}/auth/v1/health`)
        const response = await fetch(`${url}/auth/v1/health`)
        const text = await response.text()
        
        setResult({
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          body: text,
          headers: Object.fromEntries(response.headers.entries())
        })
      } catch (err: any) {
        console.error('Fetch error:', err)
        setResult({ 
          error: err.message,
          type: err.name,
          stack: err.stack
        })
      }
    }
    
    test()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Direct Fetch Test</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}