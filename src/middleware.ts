import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // מאפשר קאש אגרסיבי לקבצים סטטיים
  if (request.nextUrl.pathname.startsWith('/_next/static/')) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/_next/static/:path*',
  ],
} 