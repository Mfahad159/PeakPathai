import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight text-white">
          Peak<span className="text-violet-400">Path</span> AI
        </span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-full px-5 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
          ✦ AI-Powered Scholarship Discovery
        </div>
        <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight text-white">
          Find the scholarships <br />
          <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            you actually deserve
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-zinc-400 leading-relaxed">
          PeakPath AI scans thousands of scholarships, fellowships, and research
          opportunities — then ranks them specifically for your profile.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-violet-600 px-8 py-3 text-base font-semibold text-white hover:bg-violet-500 transition-all hover:scale-105 shadow-lg shadow-violet-900/40"
          >
            Start for free →
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/10 px-8 py-3 text-base font-medium text-zinc-300 hover:border-white/30 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} PeakPath AI · Built for ambitious scholars
      </footer>
    </div>
  );
}
