import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { opportunity } = body
    
    if (!opportunity || !opportunity.title) {
      return NextResponse.json({ error: 'Invalid opportunity data' }, { status: 400 })
    }

    // Insert opportunity into DB
    const insertRow = {
      user_id: user.id,
      title: opportunity.title,
      provider: opportunity.provider,
      deadline: opportunity.deadline,
      funding_type: opportunity.funding_type,
      location: opportunity.location,
      field: opportunity.field,
      description: opportunity.description,
      source_url: opportunity.source_url,
      raw_data: null,
      saved: true,   // explicitly setting saved to true because they clicked Bookmark
      seen: true,    // they've seen it if they saved it
      notify_updates: true // toggle default
    }

    const { data: insertedData, error: insertError } = await admin
      .from('opportunities')
      .insert([insertRow])
      .select()
      .single()

    if (insertError) {
      console.error('Save error:', insertError)
      return NextResponse.json({ error: 'Failed to insert row' }, { status: 500 })
    }

    return NextResponse.json({ opportunity: insertedData }, { status: 200 })

  } catch (err: any) {
    console.error('Save opportunity error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
