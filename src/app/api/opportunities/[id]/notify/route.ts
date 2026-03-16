import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, context: any) {
  const { params } = context;
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // params.id requires awaiting in next 15+ but typically next 14 app router it's available directly although Next.js 14 recommends destructuring but dynamic params is fine
    const opportunityId = params.id

    const body = await request.json()
    const { notify_updates } = body

    if (typeof notify_updates !== 'boolean') {
      return NextResponse.json({ error: 'Missing notify_updates boolean' }, { status: 400 })
    }

    const { data, error } = await admin
      .from('opportunities')
      .update({ notify_updates })
      .eq('id', opportunityId)
      .eq('user_id', user.id) // security check
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, opportunity: data })
  } catch (err: any) {
    console.error('Notify toggle error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
