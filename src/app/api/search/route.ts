import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { searchOpportunities } from '@/lib/tavily/search'
import { parseOpportunities } from '@/lib/openrouter/parse'
import { resend } from '@/lib/email/resend'
import { OpportunitiesEmail } from '@/components/emails/OpportunitiesEmail'
import { Profile } from '@/types'

// Get Monday of the current week as YYYY-MM-DD
function getWeekStart(): string {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // adjust to Monday
  const monday = new Date(now.setDate(diff))
  return monday.toISOString().split('T')[0]
}

export async function POST(request: NextRequest) {
  try {
    // ── Authenticate ─────────────────────────────────────────────────
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

    // ── Fetch Profile ─────────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // ── Check Quota ───────────────────────────────────────────────────
    const weekStart = getWeekStart()
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: quota } = await admin
      .from('search_quota')
      .select('searches_used')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .maybeSingle()

    const searchesUsed = quota?.searches_used ?? 0

    if (searchesUsed >= 5) {
      return NextResponse.json(
        { error: 'quota_exceeded', searches_used: searchesUsed, week_start: weekStart },
        { status: 429 }
      )
    }

    // ── Run Pipeline ──────────────────────────────────────────────────
    const rawResults = await searchOpportunities(profile as Profile)

    if (rawResults.length === 0) {
      return NextResponse.json({ error: 'no_results' }, { status: 200 })
    }

    const parsed = await parseOpportunities(rawResults)

    // ── Insert Opportunities ──────────────────────────────────────────
    let inserted: any[] = []
    if (parsed.length > 0) {
      const rows = parsed.map((opp) => ({
        user_id: user.id,
        title: opp.title,
        provider: opp.provider,
        deadline: opp.deadline,
        funding_type: opp.funding_type,
        location: opp.location,
        field: opp.field,
        description: opp.description,
        source_url: opp.source_url,
        raw_data: null,
        saved: false,
        seen: false,
      }))

      const { data: insertedData, error: insertError } = await admin
        .from('opportunities')
        .insert(rows)
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
      } else {
        inserted = insertedData ?? []
      }
    }

    // ── Increment Quota ───────────────────────────────────────────────
    await admin
      .from('search_quota')
      .upsert(
        {
          user_id: user.id,
          week_start: weekStart,
          searches_used: searchesUsed + 1,
        },
        { onConflict: 'user_id,week_start' }
      )

    // ── Send Email Verification ───────────────────────────────────────
    if (inserted.length > 0 && user.email) {
      const firstName = profile.full_name?.split(' ')[0] ?? 'Scholar'
      
      try {
        await resend.emails.send({
          from: 'PeakPath AI <noreply@peakpathai.com>', 
          to: user.email,
          subject: `We found ${inserted.length} new opportunities for you 🎯`,
          react: OpportunitiesEmail({ opportunities: parsed as any, firstName }),
        })
        console.log(`Email sent to ${user.email}`)
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // We don't throw here; we still want to return the UI results if email fails
      }
    }

    return NextResponse.json({
      opportunities: inserted,
      searches_used: searchesUsed + 1,
      searches_remaining: 4 - searchesUsed,
    })
  } catch (err: any) {
    console.error('Search pipeline error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
