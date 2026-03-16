import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch opportunity
  const { data: opp, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !opp) {
    notFound()
  }

  // Ensure ownership
  if (opp.user_id !== user.id) {
    notFound()
  }

  // Mark as seen (fire and forget)
  if (!opp.seen) {
    supabase.from('opportunities').update({ seen: true }).eq('id', opp.id).then()
  }

  const getFundingColor = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('fully') || t.includes('full')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (t.includes('partial')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* ── Back Navigation ── */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </Link>
        
        {/* ── Header Card ── */}
        <div className="glass-card overflow-hidden p-8" style={{ background: 'var(--color-surface)' }}>
          <p className="text-sm font-semibold tracking-wide" style={{ color: 'var(--color-primary)' }}>
            {opp.provider}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white leading-tight">
            {opp.title}
          </h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className={`inline-flex items-center rounded-md border px-3 py-1 text-sm font-medium ${getFundingColor(opp.funding_type)}`}>
              {opp.funding_type || 'Funding varies'}
            </span>
            <span className="inline-flex items-center rounded-md border bg-white/5 px-3 py-1 text-sm font-medium text-zinc-300 border-white/10">
              📍 {opp.location || 'Location not specified'}
            </span>
            <span className="inline-flex items-center rounded-md border bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-400 border-orange-500/20">
              🗓 {opp.deadline || 'No deadline found'}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="glass-card p-8 text-zinc-300 leading-relaxed space-y-8" style={{ background: 'rgba(11,14,26,0.4)', borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10">Field of Study</h2>
            <p>{opp.field}</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/10">Opportunity Description</h2>
            <div className="whitespace-pre-line text-sm">
              {opp.description}
            </div>
          </div>

          <div className="pt-6">
            <a 
              href={opp.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:scale-[1.02] hover:bg-orange-400"
              style={{ background: 'var(--color-primary)' }}
            >
              Apply / Learn More
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
