import Link from 'next/link'
import Image from 'next/image'

export default function TopLeftLogo() {
  return (
    <Link 
      href="/dashboard"
      className="fixed top-4 left-4 md:top-6 md:left-6 z-50 flex items-center gap-2 rounded-full border border-white/10 p-1.5 pr-3 md:pr-4 shadow-lg transition-all hover:scale-105"
      style={{
        background: 'rgba(11,14,26,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="relative h-9 w-9 overflow-hidden rounded-full bg-black/20 shrink-0 flex items-center justify-center">
        <Image 
          src="/assets/logo_peak_path_ai.webp" 
          alt="PeakPath AI" 
          fill
          unoptimized
          className="object-contain scale-110"
        />
      </div>
      <span className="text-sm font-extrabold uppercase tracking-widest text-orange-400">
        Peak<span className="text-white">Path</span>
      </span>
    </Link>
  )
}
