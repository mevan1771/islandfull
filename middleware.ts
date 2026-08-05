import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(req: NextRequest) {
  // Supabase Auth protection for /host and /admin
  if (req.nextUrl.pathname.startsWith('/host') || req.nextUrl.pathname.startsWith('/admin')) {
    return await updateSession(req)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
