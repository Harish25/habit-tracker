import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length === 0) {
    throw new Error('The environment variable JWT_SECRET is not set.')
  }
  return new TextEncoder().encode(secret)
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('session')?.value

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/habits')
                           
  const isAuthRoute = request.nextUrl.pathname.startsWith('/users/login') || 
                      request.nextUrl.pathname.startsWith('/users/register')

  // 1. Handle Protected Routes
  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/users/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
    
    try {
      await jwtVerify(token, getJwtSecretKey())
      return NextResponse.next() 
    } catch (error) {
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/users/login', request.url))
      response.cookies.delete('session') 
      return response
    }
  }

  // 2. Handle Auth Routes (Redirect logged-in users away from Login/Register)
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, getJwtSecretKey())
      
      const response = NextResponse.redirect(new URL('/dashboard', request.url))
      
      // CRITICAL: Prevent Next.js from caching the redirect state
      // This fixes the "URL changes but page stays the same" issue
      response.headers.set('x-middleware-cache', 'no-cache')
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
      
      return response
    } catch (error) {
      // If token verification fails, let them stay on the login page
      return NextResponse.next() 
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}