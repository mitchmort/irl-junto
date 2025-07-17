'use client'

import { useAuthContext } from '@/components/auth/auth-provider'

export default function TestAuthPage() {
  const { user, loading } = useAuthContext()
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <div>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>User: {user ? user.id : 'No user'}</p>
      </div>
    </div>
  )
}