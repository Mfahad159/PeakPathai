'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Opportunity } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────
interface QuotaInfo {
  searches_used: number
  searches_remaining: number
}

// ── Opportunity Card ──────────────────────────────────────────────────────────
function OpportunityCard({ opp }: { opp: Opportunity }) {
  const fundingColor: Record<string, string> = {
    'Fully Funded': 'text-green-400 bg-green-400/10 border-green-400/20',
    'Partial Funding': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'Stipend Only': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'Unknown': 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20',
  }
  const badgeClass = fundingColor[opp.funding_type] ?? fundingColor['Unknown']

  return (
    <div
      className="glass-card group flex flex-col gap-3 p-5 transition-all hover:border-orange-500/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold leading-snug text-white">{opp.title}</h3>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>{opp.provider}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
          {opp.funding_type}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--color-muted)' }}>
        {opp.deadline !== 'Not specified' && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {opp.deadline}
          </span>
        )}
        {opp.location !== 'Not specified' && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {opp.location}
          </span>
        )}
        {opp.field !== 'General' && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            {opp.field}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        {opp.description}
      </p>

      {/* Link */}
      {opp.source_url && (
        <a
          href={opp.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors"
        >
          View opportunity
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}
    </div>
  )
}

// ── Quota Bar ─────────────────────────────────────────────────────────────────
function QuotaBar({ quota }: { quota: QuotaInfo | null }) {
  if (!quota) return null
  const pct = (quota.searches_used / 5) * 100
  return (
    <div className="glass-card px-4 py-3 flex items-center gap-4">
      <div className="flex-1">
        <div className="mb-1 flex justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
          <span>Weekly searches</span>
          <span>{quota.searches_used} / 5 used</span>
        </div>
        <div className="h-1 w-full rounded-full" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${pct}%`, background: pct >= 100 ? '#f87171' : 'var(--color-primary)' }}
          />
        </div>
      </div>
      <span className="shrink-0 text-xs font-semibold" style={{ color: quota.searches_remaining > 0 ? 'var(--color-primary)' : '#f87171' }}>
        {quota.searches_remaining} left
      </span>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [quota, setQuota] = useState<QuotaInfo | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quotaError, setQuotaError] = useState(false)
  const [searched, setSearched] = useState(false)
  const [targetCountry, setTargetCountry] = useState('')
  const [fundingPref, setFundingPref] = useState('any')
  const [showPrefs, setShowPrefs] = useState(false)

  // week start: Monday
  function getWeekStart() {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().split('T')[0]
  }

  const loadInitialData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profileData }, { data: quotaData }] = await Promise.all([
      supabase.from('profiles').select('full_name, degree_level, field_of_study, country, funding_preference').eq('id', user.id).single(),
      supabase.from('search_quota').select('searches_used').eq('user_id', user.id).eq('week_start', getWeekStart()).maybeSingle(),
    ])

    setProfile(profileData)
    if (profileData) {
      setTargetCountry(profileData.country || '')
      setFundingPref(profileData.funding_preference || 'any')
    }

    const used = quotaData?.searches_used ?? 0
    setQuota({ searches_used: used, searches_remaining: 5 - used })
  }, [])

  useEffect(() => { loadInitialData() }, [loadInitialData])

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    setQuotaError(false)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_country: targetCountry,
          funding_preference: fundingPref,
        })
      })
      const data = await res.json()

      if (res.status === 429) {
        setQuotaError(true)
        setLoading(false)
        return
      }

      if (!res.ok) throw new Error(data.error ?? 'Search failed')

      setOpportunities(data.opportunities ?? [])
      setQuota({ searches_used: data.searches_used, searches_remaining: data.searches_remaining })
      setSearched(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Scholar'
  const daysUntilReset = (() => {
    const now = new Date()
    const day = now.getDay()
    return day === 1 ? 7 : (8 - day) % 7
  })()

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
              {profile?.field_of_study} · {profile?.country} · {profile?.degree_level}
            </p>
          </div>
        </div>

        {/* ── Quota Bar ── */}
        <QuotaBar quota={quota} />

        {/* ── Search Button ── */}
        <div className="glass-card p-6 text-center">
          {!loading && !quotaError && (
            <>
              <div className="mb-2 text-2xl">🔍</div>
              <h2 className="mb-1 text-sm font-semibold text-white">
                {searched ? 'Search again' : 'Find your opportunities'}
              </h2>
              <p className="mb-5 text-xs" style={{ color: 'var(--color-muted)' }}>
                We'll query the web in real-time and use AI to match results to your profile.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleSearch}
                  disabled={(quota?.searches_remaining ?? 1) <= 0}
                  className="rounded-xl px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.03] hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Find Opportunities →
                </button>
                <button
                  onClick={() => setShowPrefs(!showPrefs)}
                  className="rounded-xl border px-6 py-3 text-sm font-medium transition-colors hover:text-white"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                >
                   Edit Preferences
                </button>
              </div>

              {/* Preferences Panel */}
              {showPrefs && (
                <div className="mx-auto mt-6 max-w-sm rounded-xl border p-4 text-left transition-all" style={{ borderColor: 'var(--color-border)', background: 'rgba(11,14,26,0.6)' }}>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-semibold text-white">Target Country (or Region)</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                      style={{ borderColor: 'var(--color-border)' }}
                      placeholder="e.g. UK, Germany, Global..."
                      value={targetCountry}
                      onChange={(e) => setTargetCountry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-white">Funding Requirements</label>
                    <select
                      className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none [&>option]:bg-[#0b0e1a]"
                      style={{ borderColor: 'var(--color-border)' }}
                      value={fundingPref}
                      onChange={(e) => setFundingPref(e.target.value)}
                    >
                      <option value="any">Any Funding Type</option>
                      <option value="fully_funded">Fully Funded Only</option>
                      <option value="partial">Partial Funding Accepted</option>
                      <option value="research_fellowship">Research Fellowship / Stipend</option>
                    </select>
                  </div>
                  <p className="mt-4 text-[10px]" style={{ color: 'var(--color-muted)' }}>
                    *These preferences only apply to this specific search. They will not permanently overwrite your core profile.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <p className="text-sm font-medium text-white">Searching the web and parsing results…</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>This usually takes 10–20 seconds</p>
            </div>
          )}

          {/* Quota error */}
          {quotaError && (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="text-2xl">⏳</div>
              <p className="text-sm font-semibold text-white">Weekly limit reached</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                You've used all 5 searches this week. Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}.
              </p>
            </div>
          )}
        </div>

        {/* ── Error State ── */}
        {error && (
          <div
            className="glass-card flex items-center justify-between p-4"
            style={{ borderColor: 'var(--color-error-border)', background: 'var(--color-error-bg)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>⚠ {error}</p>
            <button
              onClick={handleSearch}
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--color-error)' }}
            >
              Retry →
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {searched && opportunities.length === 0 && !loading && !error && (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-white">No structured results found this time.</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>Try again — AI results can vary. We'll keep improving.</p>
          </div>
        )}

        {opportunities.length > 0 && (
          <div>
            <p className="mb-4 text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              {opportunities.length} opportunities found
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
