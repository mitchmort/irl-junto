'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Spinner } from '@/components/ui/spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/dashboard/login/v1' 
}) => {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8 mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    router.push(redirectTo)
    return null
  }

  // If authentication is not required but user is authenticated (like auth pages)
  if (!requireAuth && user) {
    router.push('/dashboard/default')
    return null
  }

  // Render children if authentication check passes
  return <>{children}</>
}

// HOC version for easier usage
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireAuth?: boolean; redirectTo?: string }
) => {
  const WrappedComponent = (props: P) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  )

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default AuthGuard 