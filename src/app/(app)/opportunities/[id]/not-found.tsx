import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] px-6 py-20 flex flex-col items-center justify-center text-center">
      <div className="glass-card max-w-md w-full p-8 border-orange-500/20 bg-[#121626]">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>Opportunity Not Found</h2>
        <p className="mb-8 text-sm text-zinc-400 leading-relaxed">
          The opportunity you're looking for doesn't exist or you don't have permission to view it. It may have been deleted or belong to another account.
        </p>
        <Link 
          href="/dashboard"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:bg-orange-400"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
