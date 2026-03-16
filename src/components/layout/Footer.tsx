import Link from 'next/link'
import { Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0b0e1a]/80 py-12 backdrop-blur-md mt-auto">
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
              <Github className="h-5 w-5 text-zinc-400 transition-colors group-hover:text-orange-400" />
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
          </div>
          <div className="mt-2 flex flex-col items-center md:items-end gap-1">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} PeakPath AI. All rights reserved.
            </p>
            <p className="text-zinc-600 text-[11px] tracking-wider uppercase">
              Coded with love by <a href="https://github.com/Mfahad159" target="_blank" rel="noreferrer" className="text-white-500 underline hover:text-orange-400 font-bold transition-colors">Fahad</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
