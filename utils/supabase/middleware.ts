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

  // Do not run on non-protected routes
  const isHostRoute = request.nextUrl.pathname.startsWith('/host')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  
  if (!isHostRoute && !isAdminRoute) {
      return supabaseResponse;
  }

  // Allow access to the login page itself
  if (request.nextUrl.pathname === '/host/login' || request.nextUrl.pathname === '/admin/login') {
      return supabaseResponse;
  }

  // Exempt Setup Page from Auth Bouncer so client can parse the hash token
  if (request.nextUrl.pathname === '/admin/setup-account') {
      return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    if (isAdminRoute) {
      url.pathname = '/admin/login'
    } else {
      url.pathname = '/host/login'
    }
    return NextResponse.redirect(url)
  }
  
  // If accessing /admin, enforce admin role
  if (isAdminRoute) {
    // First check the core users table for legacy admin flag
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    // Then check the new user_roles table for granular RBAC
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isSuperAdmin = profile?.role === 'admin'
    const isRbacAdmin = userRole?.role === 'admin'
    const isStaff = userRole?.role === 'staff'

    if (!isSuperAdmin && !isRbacAdmin && !isStaff) {
      const url = request.nextUrl.clone()
      url.pathname = '/host'
      return NextResponse.redirect(url)
    }

    // Staff RBAC Restrictions
    if (isStaff && !isSuperAdmin && !isRbacAdmin) {
      const restrictedRoutes = ['/admin/team', '/admin/finances', '/admin/settings']
      const path = request.nextUrl.pathname

      if (restrictedRoutes.some(route => path.startsWith(route))) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/tours'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
