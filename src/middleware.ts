import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const protectedRoutes = ['/dashboard', '/onboarding', '/profile', '/opportunities']
  const isProtected = protectedRoutes.some((r) => url.pathname.startsWith(r))
  const isAuthPage = url.pathname === '/login' || url.pathname === '/signup'

  // Not logged in → send to login
  if (!user && isProtected) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Logged in + auth page → check onboarding
  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()

    url.pathname = profile?.onboarding_complete ? '/dashboard' : '/onboarding'
    return NextResponse.redirect(url)
  }

  // Logged in + on dashboard/other app route → check onboarding
  if (user && url.pathname === '/dashboard') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()

    if (!profile?.onboarding_complete) {
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  // Logged in + already on /onboarding but onboarding is complete → send to dashboard
  if (user && url.pathname === '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete')
      .eq('id', user.id)
      .single()

    if (profile?.onboarding_complete) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
