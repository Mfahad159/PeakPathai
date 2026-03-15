'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Opportunity } from '@/types'

interface Props {
  opportunity: Opportunity
  onSaveToggle?: (id: string, newSavedState: boolean) => void
}

export default function OpportunityCard({ opportunity, onSaveToggle }: Props) {
  const [isSaved, setIsSaved] = useState(opportunity.saved)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    const newSavedState = !isSaved
    setIsSaved(newSavedState) // Optimistic update

    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/save`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error('Failed to save')
      
      if (onSaveToggle) {
        onSaveToggle(opportunity.id, newSavedState)
      }
    } catch (err) {
      console.error(err)
      setIsSaved(!newSavedState) // Revert on failure
    } finally {
      setIsSaving(false)
    }
  }

  // Determine funding badge color
  const getFundingColor = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes('fully') || t.includes('full')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (t.includes('partial')) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
      {/* ── Top row: Provider + Save ── */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-wide" style={{ color: 'var(--color-muted)' }}>
            {opportunity.provider}
          </p>
          <h3 className="mt-1 line-clamp-2 text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
            {opportunity.title}
          </h3>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="cursor-pointer rounded-full p-2 transition-colors hover:bg-white/5"
          title={isSaved ? "Remove from saved" : "Save opportunity"}
        >
          {isSaved ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-orange-500">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-zinc-400 hover:text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Badges ── */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getFundingColor(opportunity.funding_type)}`}>
          {opportunity.funding_type || 'Funding varies'}
        </span>
        <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium bg-white/5 text-zinc-300 border-white/10">
          📍 {opportunity.location || 'Location not specified'}
        </span>
      </div>

      {/* ── Details ── */}
      <div className="mb-5 space-y-1 text-sm text-zinc-400">
        <p><span className="font-semibold text-zinc-300">Field:</span> {opportunity.field}</p>
        <p><span className="font-semibold text-zinc-300">Deadline:</span> <span className={opportunity.deadline ? 'text-orange-400/90' : ''}>{opportunity.deadline || 'No deadline found'}</span></p>
      </div>

      <p className="mb-6 line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
        {opportunity.description}
      </p>

      {/* ── Bottom CTA ── */}
      <div className="pr-1 pt-1 border-t align-bottom flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
        {opportunity.seen && (
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Viewed</span>
        )}
        {!opportunity.seen && <span />}
        <Link
          href={`/opportunities/${opportunity.id}`}
          className="cursor-pointer inline-flex items-center gap-1 mt-3 px-4 py-2 text-sm font-semibold transition-colors hover:text-orange-400"
          style={{ color: 'var(--color-primary)' }}
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}
