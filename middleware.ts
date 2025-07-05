import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes - require authentication
  const protectedPaths = ['/dashboard']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path) && 
    !request.nextUrl.pathname.startsWith('/dashboard/login') &&
    !request.nextUrl.pathname.startsWith('/dashboard/register') &&
    !request.nextUrl.pathname.startsWith('/dashboard/forgot-password')
  )

  // Public auth routes - redirect to dashboard if already authenticated
  const authPaths = ['/dashboard/login', '/dashboard/register', '/dashboard/forgot-password']
  const isAuthPath = authPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Root path redirect
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/dashboard') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard/default', request.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard/login/v1', request.url))
    }
  }

  // Redirect unauthenticated users to login
  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/dashboard/login/v1', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard/default', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
