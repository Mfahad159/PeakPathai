'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Opportunity } from '@/types'
import { Bookmark, MapPin, DollarSign, Target, Calendar, ExternalLink } from 'lucide-react'

interface Props {
  opportunity: Opportunity
  onSaveToggle?: (id: string, newSavedState: boolean) => void
}

export default function OpportunityCard({ opportunity, onSaveToggle }: Props) {
  const [isSaved, setIsSaved] = useState(opportunity.saved)
  const [isSaving, setIsSaving] = useState(false)
  const [realId, setRealId] = useState(opportunity.id)
  const [notifyUpdates, setNotifyUpdates] = useState(opportunity.notify_updates ?? true)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSaving) return

    setIsSaving(true)
    const newSavedState = !isSaved
    setIsSaved(newSavedState)

    try {
      let currentRealId = realId
      
      if (newSavedState && currentRealId.startsWith('temp_')) {
        const res = await fetch('/api/opportunities/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunity }),
        })
        if (!res.ok) throw new Error('Failed to create saved row')
        const data = await res.json()
        currentRealId = data.opportunity.id
        setRealId(currentRealId) // Lock in DB ID
      } else {
        const res = await fetch(`/api/opportunities/${currentRealId}/save`, {
          method: 'PATCH',
        })
        if (!res.ok) throw new Error('Failed to toggle save')
      }
      
      if (onSaveToggle) {
        onSaveToggle(opportunity.id, newSavedState)
      }
    } catch (err) {
      console.error(err)
      setIsSaved(!newSavedState)
    } finally {
      setIsSaving(false)
    }
  }

  const handleNotifyToggle = async () => {
    const newVal = !notifyUpdates
    setNotifyUpdates(newVal)
    try {
      await fetch(`/api/opportunities/${realId}/notify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notify_updates: newVal }),
      })
    } catch (err) {
      console.error('Failed to toggle notify', err)
      setNotifyUpdates(!newVal)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0e1a]/80 shadow flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 transition-all w-full relative">
      
      {/* ── CardHeader ── */}
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 text-left flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
              {opportunity.provider}
            </p>
            <h3 className="font-semibold leading-tight text-white text-lg line-clamp-2 group-hover:text-orange-400 transition-colors">
              {opportunity.title}
            </h3>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="cursor-pointer rounded-full p-2 transition-colors hover:bg-white/10 shrink-0 shadow-sm border border-white/5 bg-[#121626]"
            title={isSaved ? "Remove from saved" : "Save opportunity"}
          >
            <Bookmark 
              className={`h-4 w-4 ${isSaved ? 'text-orange-500 fill-orange-500' : 'text-zinc-400 hover:text-white'}`} 
            />
          </button>
        </div>
      </div>

      {/* ── CardContent ── */}
      <div className="px-6 py-2 flex-1 flex flex-col text-sm text-zinc-300">
        
        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 mb-5">
           <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
             <DollarSign className="w-3.5 h-3.5 mr-1" /> {opportunity.funding_type || 'Funding varies'}
           </span>
           <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
             <MapPin className="w-3.5 h-3.5 mr-1" /> {opportunity.location || 'Location not specified'}
           </span>
        </div>
        
        {/* Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 text-xs font-medium bg-white/5 p-3 rounded-lg border border-white/5">
           <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-400/80" /> 
              <span className="line-clamp-1">{opportunity.field}</span>
           </div>
           <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-400/80" /> 
              <span className="line-clamp-1">{opportunity.deadline || 'No deadline found'}</span>
           </div>
        </div>
        
        {/* Description */}
        <p className="line-clamp-3 text-sm leading-relaxed flex-1" style={{ color: 'var(--color-muted)' }}>
          {opportunity.description}
        </p>
      </div>

      {/* ── CardFooter ── */}
      <div className="p-6 pt-4 flex flex-col gap-3 border-t border-white/5 mt-auto bg-white/[0.02]">
         
         <div className="flex items-center justify-between w-full">
            <div className="text-xs">
               {opportunity.seen && <span className="font-bold tracking-widest text-zinc-500 uppercase">Viewed</span>}
            </div>
            <Link
              href={`/opportunities/${realId}`}
              className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold transition-colors hover:text-orange-400 ${realId.startsWith('temp_') ? 'pointer-events-none opacity-50' : ''}`}
              style={{ color: 'var(--color-primary)' }}
            >
              {realId.startsWith('temp_') ? "Save to View" : "View Details"}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
         </div>

         {/* ── Email Toggle (shadcn aesthetic switch) ── */}
         {isSaved && !realId.startsWith('temp_') && (
           <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
             <span className="text-xs text-zinc-400 font-medium">Notify me of updates</span>
             <label className="relative inline-flex cursor-pointer items-center">
               <input type="checkbox" className="peer sr-only" checked={notifyUpdates} onChange={handleNotifyToggle} disabled={isSaving} />
               <div className="peer h-5 w-9 rounded-full bg-zinc-700 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-orange-500 peer-checked:after:translate-x-full"></div>
             </label>
           </div>
         )}
         
      </div>

    </div>
  )
}
