import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set() {},
          remove() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: opportunityId } = await params

    // Check ownership & current saved state
    const { data: opp, error: fetchErr } = await supabase
      .from('opportunities')
      .select('user_id, saved')
      .eq('id', opportunityId)
      .single()

    if (fetchErr || !opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    if (opp.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Toggle saved state
    const { error: updateErr } = await supabase
      .from('opportunities')
      .update({ saved: !opp.saved })
      .eq('id', opportunityId)

    if (updateErr) {
      throw updateErr
    }

    return NextResponse.json({ success: true, saved: !opp.saved })
  } catch (err: any) {
    console.error('Save error:', err)
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 })
  }
}
