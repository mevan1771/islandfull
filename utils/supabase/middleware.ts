import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run on non-host routes
  if (!request.nextUrl.pathname.startsWith('/host')) {
      return supabaseResponse;
  }

  // Allow access to the login page itself
  if (request.nextUrl.pathname === '/host/login') {
      return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/host/login'
    return NextResponse.redirect(url)
  }
  
  // Optionally check user role from a custom claim or profile table
  // For now, if they are logged in via Supabase, they have access to /host
  // Role checks (provider) will primarily be enforced by RLS in the database.

  return supabaseResponse
}
