'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/auth-provider'
import { Spinner } from '@/components/ui/spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requirePhoneVerification?: boolean
  redirectTo?: string
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  requirePhoneVerification = false,
  redirectTo = '/dashboard/login/sms' 
}) => {
  const { user, customUser, loading } = useAuthContext()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = React.useState(false)

  React.useEffect(() => {
    console.log('AuthGuard effect:', { loading, user: !!user, requireAuth, isRedirecting })
    
    // Don't do anything while loading
    if (loading) return

    // Reset redirecting state if user state matches requirements
    if (requireAuth && user && isRedirecting) {
      console.log('AuthGuard: User authenticated, stopping redirect')
      setIsRedirecting(false)
      return
    }

    // Handle authentication redirects
    if (requireAuth && !user && !isRedirecting) {
      console.log('AuthGuard: No user found, redirecting to login')
      setIsRedirecting(true)
      router.push(redirectTo)
    } else if (requirePhoneVerification && user && (!customUser || !customUser.phone_verified) && !isRedirecting) {
      console.log('AuthGuard: Phone verification required, redirecting')
      setIsRedirecting(true)
      router.push('/dashboard/login/sms')
    } else if (!requireAuth && user && !isRedirecting) {
      console.log('AuthGuard: User found on auth page, redirecting to dashboard')
      setIsRedirecting(true)
      router.push('/dashboard/default')
    }
  }, [user, customUser, loading, requireAuth, requirePhoneVerification, redirectTo, router, isRedirecting])

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('AuthGuard: Still loading')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner className="mx-auto h-8 w-8 mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (isRedirecting) {
    console.log('AuthGuard: Redirecting')
    return null
  }

  // Render children if authentication check passes
  console.log('AuthGuard: Rendering children')
  return <>{children}</>
}

// HOC version for easier usage
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireAuth?: boolean; requirePhoneVerification?: boolean; redirectTo?: string }
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