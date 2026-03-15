import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#0b0e1a] text-white overflow-hidden">

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow blob */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-900/30 blur-[120px]" />

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-4 border-b border-white/5">
        <span className="rounded border border-orange-500/60 px-2 py-1 text-xs font-bold uppercase tracking-widest text-orange-400">
          Peak<span className="text-white">Path</span>
        </span>
        <div className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
          <Link
            href="/signup"
            className="rounded-md bg-orange-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-400 transition-colors"
          >
            Get started →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-400">
          ✦ AI-Powered Scholarship Discovery
        </div>

        <h1 className="max-w-3xl text-6xl font-extrabold leading-[1.08] tracking-tight text-white"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
          Find scholarships{" "}
          <span className="text-orange-400">you deserve</span>
        </h1>

        <p className="mt-6 max-w-xl text-base text-zinc-400 leading-relaxed">
          PeakPath AI scans thousands of scholarships, fellowships, and research
          opportunities — then ranks them by your exact profile.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-orange-500 px-7 py-3 text-sm font-semibold text-white hover:bg-orange-400 transition-all hover:scale-[1.03] shadow-lg shadow-orange-900/40"
          >
            Browse opportunities →
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/10 px-7 py-3 text-sm font-medium text-zinc-300 hover:border-white/30 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-14 flex items-center gap-2 text-xs text-zinc-500">
          <span className="text-orange-400">★★★★★</span>
          <span>Trusted by students from 40+ countries</span>
        </div>
      </main>

       {/* ── Feature strip ── */}
      <section id="features" className="relative z-10 border-t border-white/5 px-8 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: "🔍", title: "AI-Powered Search", desc: "DeepSeek scans and ranks opportunities matching your profile." },
            { icon: "🎯", title: "Profile-Matched", desc: "Results filtered by degree level, field, country and funding type." },
            { icon: "⏰", title: "Deadline Alerts", desc: "Never miss a deadline with automated email reminders." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/8 bg-white/3 p-6 backdrop-blur-sm hover:border-orange-500/30 transition-colors"
            >
              <div className="mb-3 text-2xl">{f.icon}</div>
              <h3 className="mb-1 text-sm font-semibold text-orange-400">{f.title}</h3>
              <p className="text-xs leading-relaxed text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-6 text-xs text-zinc-600">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span>© {new Date().getFullYear()} PeakPath AI</span>
          <span>Built for ambitious scholars</span>
        </div>
      </footer>
    </div>
  );
}
