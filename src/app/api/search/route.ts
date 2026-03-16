import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { searchOpportunities } from '@/lib/tavily/search'
import { parseOpportunities } from '@/lib/openrouter/parse'
import { resend } from '@/lib/email/resend'
import { OpportunitiesEmail } from '@/components/emails/OpportunitiesEmail'
import { Profile } from '@/types'
import { getWeekStart } from '@/lib/date'



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

    // ── Parse Custom Search Preferences ───────────────────────────────
    const body = await request.json().catch(() => ({}))
    
    // Convert array back to a comma separated string for the model prompt
    const countryString = body.target_countries?.length > 0 
      ? body.target_countries.join(' and ') 
      : profile.country

    const searchPrefs = {
      ...profile,
      country: countryString,
      funding_preference: body.funding_preference || profile.funding_preference
    }

    // ── Run Pipeline ──────────────────────────────────────────────────
    const rawResults = await searchOpportunities(searchPrefs as Profile)

    if (rawResults.length === 0) {
      return NextResponse.json({ error: 'no_results' }, { status: 200 })
    }

    const parsed = await parseOpportunities(rawResults)

    // ── Deduplicate against DB ───────────────────────────────────────
    let finalParsed = parsed
    if (parsed.length > 0) {
      const titles = parsed.map((o) => o.title).filter(Boolean)
      const urls = parsed.map((o) => o.source_url).filter(Boolean)

      let existingRecords: any[] = []
      try {
        const { data } = await admin
          .from('opportunities')
          .select('title, source_url')
          .eq('user_id', user.id)
          .or(`title.in.(${titles.map(t => `"${t.replace(/"/g, '""')}"`).join(',')}),source_url.in.(${urls.map(u => `"${u.replace(/"/g, '""')}"`).join(',')})`)
        existingRecords = data || []
      } catch (e) {
        existingRecords = []
      }
      
      if (existingRecords && existingRecords.length > 0) {
        const existingTitles = new Set(existingRecords.map((r: any) => r.title?.toLowerCase()))
        const existingUrls = new Set(existingRecords.map((r: any) => r.source_url?.toLowerCase()))

        finalParsed = parsed.filter(opp => {
          const t = opp.title?.toLowerCase()
          const u = opp.source_url?.toLowerCase()
          return !(t && existingTitles.has(t)) && !(u && existingUrls.has(u))
        })
      }
    }

    if (finalParsed.length === 0) {
       // Increment quota since search still happened and returned valid results (just dupes)
       await admin.from('search_quota').upsert({ user_id: user.id, week_start: weekStart, searches_used: searchesUsed + 1}, { onConflict: 'user_id,week_start' })
       
       return NextResponse.json({ 
         status: 'no_new_results', 
         message: "No new opportunities found — you're up to date.",
         searches_used: searchesUsed + 1,
         searches_remaining: 4 - searchesUsed
       }, { status: 200 })
    }

    // ── Prepare Temporary Payload (NO DB INSERT) ─────────────────────
    const localReturn = finalParsed.map((opp, idx) => ({
      id: `temp_${Date.now()}_${idx}`, // temporary ID
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
      notify_updates: true
    }))

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

    return NextResponse.json({
      opportunities: localReturn,
      searches_used: searchesUsed + 1,
      searches_remaining: 4 - searchesUsed,
    })
  } catch (err: any) {
    console.error('Search pipeline error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
