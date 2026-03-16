import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0b0e1a]/80 py-12 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row md:items-start px-6">
        {/* Left Side: Logo & Slogan */}
        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
          <div className="flex items-baseline font-sans tracking-[-0.08em]">
            <span className="text-4xl font-black text-white">PEAK</span>
            <span className="text-4xl font-light text-orange-500">PATH</span>
          </div>
          <p className="max-w-xs text-sm text-zinc-400">
            Empowering your academic journey with AI-driven discovery.
          </p>
        </div>

        {/* Right Side: Links & Socials */}
        <div className="flex flex-col items-center gap-4 md:items-end">
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/Mfahad159/PeakPathai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all hover:border-orange-500/50 hover:bg-orange-500/10 hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]"
              aria-label="GitHub Repository"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 transition-colors group-hover:text-orange-400">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7.a5.2 5.2 0 0 0-1.5-3.8 4.6 4.6 0 0 0-1.3-3.1s-1.1-.3-3.5 1.3a11.4 11.4 0 0 0-6 0C6.9 1.7 5.8 2 5.8 2a4.6 4.6 0 0 0-1.3 3.1 5.2 5.2 0 0 0-1.5 3.8c0 5.6 3.35 6.6 6.5 7a4.8 4.8 0 0 0-1 3.03V22"></path>
                <path d="M9 20c-5 1.5-5-2.5-7-3"></path>
              </svg>
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
          </div>
          <p className="mt-2 text-xs text-zinc-600">
            © {new Date().getFullYear()} PeakPath AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
