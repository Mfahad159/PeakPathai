import Link from 'next/link'

export default function Loading() {
  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* ── Back Navigation Skeleton ── */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>
        
        {/* ── Header Card Skeleton ── */}
        <div className="glass-card overflow-hidden p-8 animate-pulse" style={{ background: 'var(--color-surface)' }}>
          <div className="h-4 w-32 bg-orange-500/20 rounded mb-4" />
          <div className="h-10 w-3/4 bg-white/10 rounded mb-2" />
          <div className="h-10 w-1/2 bg-white/10 rounded mb-6" />

          <div className="flex flex-wrap gap-3">
            <div className="h-8 w-24 bg-white/10 rounded-md" />
            <div className="h-8 w-32 bg-white/10 rounded-md" />
            <div className="h-8 w-28 bg-white/10 rounded-md" />
          </div>
        </div>

        {/* ── Body Skeleton ── */}
        <div className="glass-card p-8 space-y-8 animate-pulse" style={{ background: 'rgba(11,14,26,0.4)', borderColor: 'var(--color-border)' }}>
          <div>
            <div className="h-6 w-32 bg-white/10 rounded mb-4" />
            <div className="h-4 w-full bg-white/5 rounded" />
          </div>

          <div>
            <div className="h-6 w-48 bg-white/10 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-5/6 bg-white/5 rounded" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
          </div>

          <div className="pt-6">
            <div className="h-14 w-full bg-orange-500/20 rounded-xl" />
          </div>
        </div>

      </div>
    </div>
  )
}
