'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Opportunity } from '@/types'
import Link from 'next/link'
import { motion } from 'framer-motion'
import OpportunityCard from '@/components/opportunity/OpportunityCard'
import { getWeekStart } from '@/lib/date'
import { AlertCircle, Search, Hourglass } from 'lucide-react'

const COUNTRIES = [
  "Global", "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Netherlands", "Sweden", "Switzerland", "Japan", "South Korea", 
  "Singapore", "China", "New Zealand", "Ireland", "Italy", "Spain", "Norway", 
  "Denmark", "Finland", "Austria", "Belgium"
]

// ── Types ─────────────────────────────────────────────────────────────────────
interface QuotaInfo {
  searches_used: number
  searches_remaining: number
}

function getNextMonday() {
  const d = new Date()
  d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7 || 7)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function SkeletonCard() {
  return (
    <div className="glass-card animate-pulse p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 bg-white/10 rounded"></div>
          <div className="h-4 w-1/2 bg-white/5 rounded"></div>
        </div>
        <div className="h-8 w-8 bg-white/10 rounded-full ml-4"></div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-24 bg-orange-500/10 rounded-full"></div>
        <div className="h-6 w-32 bg-white/5 rounded-full"></div>
      </div>
      <div className="space-y-2 mb-6">
        <div className="h-4 w-full bg-white/5 rounded"></div>
        <div className="h-4 w-full bg-white/5 rounded"></div>
        <div className="h-4 w-4/5 bg-white/5 rounded"></div>
      </div>
      <div className="h-4 w-24 bg-orange-500/20 rounded"></div>
    </div>
  )
}

function QuotaBar({ quota }: { quota: QuotaInfo | null }) {
  if (!quota) return null
  const pct = (quota.searches_used / 5) * 100
  const resetDate = getNextMonday()
  const isExhausted = quota.searches_remaining <= 0

  return (
    <div className="glass-card px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-white">Search Quota</span>
          <span className="font-semibold" style={{ color: isExhausted ? '#f87171' : 'var(--color-primary)' }}>
            {quota.searches_used} of 5 used this week
          </span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%`, background: isExhausted ? '#f87171' : 'var(--color-primary)' }}
          />
        </div>
        <p className="mt-2 text-xs" style={{ color: 'var(--color-muted)' }}>
          Quota resets on {resetDate}
        </p>
      </div>
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
  const [targetCountries, setTargetCountries] = useState<string[]>([])
  const [countrySearch, setCountrySearch] = useState('')
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const [fundingPref, setFundingPref] = useState('any')
  const [showPrefs, setShowPrefs] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all')



  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadInitialData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profileData }, { data: quotaData }, { data: oppsData }] = await Promise.all([
      supabase.from('profiles').select('full_name, degree_level, field_of_study, country, funding_preference').eq('id', user.id).single(),
      supabase.from('search_quota').select('searches_used').eq('user_id', user.id).eq('week_start', getWeekStart()).maybeSingle(),
      supabase.from('opportunities').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    setProfile(profileData)
    if (profileData) {
      setTargetCountries(profileData.country ? [profileData.country] : [])
      setFundingPref(profileData.funding_preference || 'any')
    }

    if (oppsData) {
      setOpportunities(oppsData)
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
          target_countries: targetCountries,
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
  const unseenCount = opportunities.filter(o => !o.seen).length

  const daysUntilReset = (() => {
    const now = new Date()
    const day = now.getDay()
    return day === 1 ? 7 : (8 - day) % 7
  })()

  return (
    <div className="min-h-screen px-6 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl space-y-6"
      >



        {/* ── Header ── */}
        <div className="flex items-start justify-between mt-12">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Overview</p>
            <h1 className="mt-1 text-3xl font-bold text-white relative inline-block" style={{ fontFamily: 'Georgia, serif' }}>
              Welcome back, {firstName}
              {unseenCount > 0 && (
                <span className="absolute -top-1 -right-4 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-bounce">
                  {unseenCount}
                </span>
              )}
            </h1>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
              {profile?.field_of_study} · {profile?.country} · {profile?.degree_level}
            </p>
          </div>
        </div>

        {/* ── Unseen Alert ── */}
        {unseenCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card flex items-center justify-between border-orange-500/50 bg-orange-500/10 p-4"
          >
            <div className="flex items-center gap-3 text-orange-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 animate-pulse">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">You have {unseenCount} new {unseenCount === 1 ? 'opportunity' : 'opportunities'} to review!</span>
            </div>
          </motion.div>
        )}

        {/* ── Quota Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <QuotaBar quota={quota} />
        </motion.div>

        {/* ── Search Button ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card p-6 text-center"
        >
          {!loading && !quotaError && (
            <>
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10 text-zinc-400 hover:text-white">
                <Search size={24} />
              </div>
              <h2 className="mb-1 text-sm font-semibold text-white">
                {searched ? 'Search again' : 'Find your opportunities'}
              </h2>
              <p className="mb-5 text-xs" style={{ color: 'var(--color-muted)' }}>
                We'll query the web in real-time and use AI to match results to your profile.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="relative group/tooltip">
                  <button
                    onClick={handleSearch}
                    disabled={(quota?.searches_remaining ?? 1) <= 0 || loading}
                    className="cursor-pointer rounded-xl px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.03] hover:bg-orange-400 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed disabled:hover:bg-orange-500 w-full sm:w-auto"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    Find Opportunities →
                  </button>
                  {/* Tooltip */}
                  {(quota?.searches_remaining ?? 1) <= 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 transition-opacity group-hover/tooltip:opacity-100 pointer-events-none">
                      <div className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-white shadow-xl">
                        Quota resets on {getNextMonday()}
                        <div className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-4 border-transparent border-t-zinc-800" />
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowPrefs(true)}
                  className="cursor-pointer rounded-xl border px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                >
                   Edit Preferences
                </button>
              </div>

              {/* Preferences Modal */}
              {showPrefs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0e1a]/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="glass-card w-full max-w-sm text-left shadow-2xl" style={{ background: 'var(--color-surface)' }}>
                    <div className="p-6">
                      <h3 className="mb-5 text-lg font-bold text-white">Edit Search Preferences</h3>
                      
                      <div className="mb-4 relative" ref={dropdownRef}>
                        <label className="mb-1.5 flex justify-between text-xs font-semibold text-white">
                          <span>Target Countries (Max 5)</span>
                          <span style={{ color: 'var(--color-muted)' }}>{targetCountries.length}/5</span>
                        </label>
                        
                        {/* Selected Badges */}
                        {targetCountries.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {targetCountries.map(c => (
                              <span key={c} className="inline-flex items-center gap-1 rounded bg-orange-500/20 px-2 py-1 text-xs text-orange-400 border border-orange-500/30">
                                {c}
                                <button
                                  onClick={() => setTargetCountries(prev => prev.filter(x => x !== c))}
                                  className="ml-1 cursor-pointer hover:text-white"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Search Input */}
                        <input
                          type="text"
                          className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-orange-500 focus:outline-none disabled:opacity-50"
                          style={{ borderColor: 'var(--color-border)' }}
                          placeholder={targetCountries.length >= 5 ? "Limit reached" : "Search countries..."}
                          value={countrySearch}
                          disabled={targetCountries.length >= 5}
                          onClick={() => setIsCountryDropdownOpen(true)}
                          onChange={(e) => {
                            setCountrySearch(e.target.value)
                            setIsCountryDropdownOpen(true)
                          }}
                        />

                        {/* Dropdown Menu */}
                        {isCountryDropdownOpen && targetCountries.length < 5 && (
                          <div className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border bg-[#121626] py-1 shadow-xl scrollbar-thin scrollbar-thumb-orange-500/50" style={{ borderColor: 'var(--color-border)' }}>
                            {COUNTRIES.filter(c => !targetCountries.includes(c) && c.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                              <button
                                key={c}
                                className="cursor-pointer w-full px-3 py-1.5 text-left text-sm text-white hover:bg-orange-500/20 hover:text-orange-400"
                                onClick={() => {
                                  setTargetCountries(prev => [...prev, c])
                                  setCountrySearch('')
                                  setIsCountryDropdownOpen(false)
                                }}
                              >
                                {c}
                              </button>
                            ))}
                            {COUNTRIES.filter(c => !targetCountries.includes(c) && c.toLowerCase().includes(countrySearch.toLowerCase())).length === 0 && (
                              <div className="px-3 py-2 text-xs text-zinc-500">No matching countries found.</div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-6">
                        <label className="mb-1.5 block text-xs font-semibold text-white">Funding Requirements</label>
                        <select
                          className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm text-white transition-colors focus:border-orange-500 focus:outline-none [&>option]:bg-[#0b0e1a]"
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
                      
                      <p className="mb-8 text-[11px] leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                        *These preferences only apply to this specific search. They will not permanently overwrite your core profile.
                      </p>
                      
                      <div className="flex items-center justify-end gap-3 border-t pt-5" style={{ borderColor: 'var(--color-border)' }}>
                        <button
                          onClick={() => setShowPrefs(false)}
                          className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          Close
                        </button>
                        <button
                          onClick={() => setShowPrefs(false)}
                          className="cursor-pointer rounded-lg px-5 py-2 text-sm font-bold text-white transition-all hover:scale-[1.03]"
                          style={{ background: 'var(--color-primary)' }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-sm font-medium animate-pulse text-white">Searching the web and parsing results…</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          )}

          {/* Quota error */}
          {quotaError && (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="inline-flex items-center justify-center rounded-lg bg-orange-500/10 p-3 transition-colors hover:bg-orange-500/20 text-orange-400">
                <Hourglass size={24} />
              </div>
              <p className="text-sm font-semibold text-white">Weekly limit reached</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                You've used all 5 searches this week. Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}.
              </p>
            </div>
          )}
        </motion.div>

        {/* ── Error State ── */}
        {error && (
          <div
            className="glass-card flex flex-col items-center justify-center p-8 mt-6 text-center"
            style={{ borderColor: 'var(--color-error-border)', background: 'var(--color-error-bg)' }}
          >
            <AlertCircle className="h-8 w-8 mb-3" style={{ color: 'var(--color-error)' }} />
            <h3 className="text-sm font-semibold text-white mb-1">Search Pipeline Failed</h3>
            <p className="text-xs mb-4 max-w-sm" style={{ color: 'var(--color-error)' }}>Something went wrong while searching. Try again in a moment. ({error})</p>
            <button
              onClick={handleSearch}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
              style={{ color: 'var(--color-error)' }}
            >
              Retry Search
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="mt-8 flex border-b" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setActiveTab('all')}
            className={`cursor-pointer px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'all' ? 'border-b-2 border-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`cursor-pointer px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'saved' ? 'border-b-2 border-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Saved
          </button>
        </div>

        {/* ── Results ── */}
        {(() => {
          const displayedOpps = activeTab === 'saved' ? opportunities.filter(o => o.saved) : opportunities
          
          if (displayedOpps.length === 0 && !loading && !error) {
            return (
              <div className="glass-card mt-6 p-8 text-center">
                {activeTab === 'all' ? (
                  <>
                    <p className="text-sm font-medium text-white">No opportunities yet.</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>Hit "Find Opportunities" to run your first search.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-white">Nothing saved yet.</p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>Bookmark opportunities you want to revisit.</p>
                  </>
                )}
              </div>
            )
          }

          if (loading || error) return null

          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6"
            >
              <p className="mb-4 text-xs tracking-widest uppercase" style={{ color: 'var(--color-muted)' }}>
                {displayedOpps.length} {activeTab === 'saved' ? 'saved opportunities' : 'opportunities found'}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {displayedOpps.map((opp, i) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * i + 0.5 }}
                  >
                    <OpportunityCard 
                      opportunity={opp} 
                      onSaveToggle={(id, saved) => {
                        setOpportunities(prev => prev.map(o => o.id === id ? { ...o, saved } : o))
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )
        })()}

      </motion.div>
    </div>
  )
}
