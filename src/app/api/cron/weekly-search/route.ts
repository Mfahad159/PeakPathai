import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { searchOpportunities } from '@/lib/tavily/search'
import { parseOpportunities } from '@/lib/openrouter/parse'
import { sendOpportunityDigest } from '@/lib/email/sendOpportunityDigest'
import { getWeekStart } from '@/lib/date'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use Service Role Key to bypass RLS for background jobs
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Current UTC time checking
    const now = new Date()
    const currentDay = now.getUTCDay() // 0-6 (Sun-Sat)

    console.log(`Cron triggered: Day ${currentDay} UTC`)

    // We fetch all users who:
    // 1. Have completed onboarding
    // 2. Scheduled to be notified on this exactly this UTC day
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('onboarding_complete', true)
      .eq('notification_day', currentDay)

    if (profileErr) throw profileErr
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'No eligible users for this timeslot' })
    }

    console.log(`Found ${profiles.length} users to process for timeslot`)

    // Week start calculation
    const weekStartIso = getWeekStart(now)

    const processedUsers = []

    for (const profile of profiles) {
      try {
        // 1. Check weekly quota
        const { data: quota } = await supabase
          .from('search_quota')
          .select('searches_used')
          .eq('user_id', profile.id)
          .eq('week_start', weekStartIso)
          .single()

        const used = quota?.searches_used || 0
        if (used >= 5) {
          console.log(`Skipping user ${profile.id} - quota exceeded`)
          continue
        }

        // Fetch auth details to get the email (since profiles table only has id and full_name)
        const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(profile.id)
        if (userErr || !userData.user?.email) {
          console.log(`Skipping user ${profile.id} - no email found`)
          continue
        }
        const userEmail = userData.user.email
        const firstName = profile.full_name?.split(' ')[0] || 'Scholar'

        // 2. Run the full search pipeline natively
        console.log(`Running pipeline for ${userEmail} with profile ${profile.id}`)
        const searchCtx = await searchOpportunities(profile as any)
        const opportunities = await parseOpportunities(searchCtx)

        if (opportunities.length === 0) {
          console.log(`No opportunities found for ${userEmail}`)
          continue
        }

        // 3. Insert opportunities into DB
        const toInsert = opportunities.map((opp: any) => ({
          user_id: profile.id,
          title: opp.title,
          provider: opp.provider,
          deadline: opp.deadline || null,
          funding_type: opp.funding_type || null,
          location: opp.location || null,
          field: opp.field || null,
          description: opp.description || null,
          source_url: opp.source_url || null,
          raw_data: opp.raw_data || null,
          seen: false, // Explicitly false so the UI badge lights up
        }))

        const { data: insertedOpps, error: insertErr } = await supabase
          .from('opportunities')
          .insert(toInsert)
          .select()

        if (insertErr) {
          console.error(`DB Insert failed for ${userEmail}:`, insertErr)
          continue
        }

        // 4. Increment Quota
        const { error: upsertErr } = await supabase
          .from('search_quota')
          .upsert(
            { user_id: profile.id, week_start: weekStartIso, searches_used: used + 1 },
            { onConflict: 'user_id,week_start' }
          )
        if (upsertErr) console.error(`Quota upsert failed for ${profile.id}`, upsertErr)

        // 5. Send Transactional Email Digest
        await sendOpportunityDigest(userEmail, firstName, insertedOpps as any)
        
        processedUsers.push(userEmail)

      } catch (err) {
        // Log but don't crash the entire cron if ONE user fails tightly
        console.error(`Error processing user ${profile.id}:`, err)
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: processedUsers.length,
      users: processedUsers 
    })

  } catch (error: any) {
    console.error('Fatal cron error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
