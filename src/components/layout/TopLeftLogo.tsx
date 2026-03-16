import Link from 'next/link'

export default function TopLeftLogo() {
  return (
    <Link 
      href="/dashboard"
      className="fixed top-4 left-4 md:top-6 md:left-6 z-50 flex items-center rounded-full border border-white/10 px-4 py-2 shadow-lg transition-all hover:scale-105"
      style={{
        background: 'rgba(11,14,26,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-baseline font-sans tracking-[-0.08em] ml-1 pr-2">
        <span className="text-2xl font-black text-white">PEAK</span>
        <span className="text-2xl font-light text-orange-500">PATH</span>
      </div>
    </Link>
  )
}
