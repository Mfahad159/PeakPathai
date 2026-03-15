'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

// ── Floating Glass Header ──────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav
        className="flex items-center gap-6 rounded-2xl px-5 py-3 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(11,14,26,0.85)' : 'rgba(11,14,26,0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Logo */}
        <span className="rounded border border-orange-500/60 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-orange-400 mr-4">
          Peak<span className="text-white">Path</span>
        </span>

        {/* Links */}
        <a href="#features" className="text-xs text-zinc-400 hover:text-white transition-colors">Features</a>
        <a href="#how" className="text-xs text-zinc-400 hover:text-white transition-colors">How it works</a>
        <a href="#testimonials" className="text-xs text-zinc-400 hover:text-white transition-colors">Reviews</a>
        <a href="#faq" className="text-xs text-zinc-400 hover:text-white transition-colors">FAQ</a>

        <div className="ml-4 flex items-center gap-2">
          <Link href="/login" className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-400 transition-all hover:scale-[1.03]"
          >
            Get started →
          </Link>
        </div>
      </nav>
    </header>
  )
}

// ── Stat ──────────────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold text-white" style={{ fontFamily: 'Georgia, serif' }}>{value}</p>
      <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>{label}</p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden text-white"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Global grid overlay */}
      <div className="page-grid pointer-events-none fixed inset-0 z-0" />

      <Header />

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pb-24 pt-40 text-center">
        {/* Glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)' }}
        />

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-400">
          ✦ AI-Powered Scholarship Discovery
        </div>

        <h1
          className="max-w-3xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Find the scholarships<br />
          <span className="text-orange-400">you actually deserve</span>
        </h1>

        <p className="mt-6 max-w-lg text-base leading-relaxed" style={{ color: 'var(--color-muted)' }}>
          PeakPath AI scans thousands of scholarships, fellowships, and research
          opportunities — then ranks them by your exact degree, field, country, and funding preference.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/40 transition-all hover:bg-orange-400 hover:scale-[1.03]"
          >
            Find my scholarships →
          </Link>
          <a
            href="#how"
            className="rounded-xl border px-8 py-3 text-sm font-medium transition-colors hover:border-white/30 hover:text-white"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            See how it works
          </a>
        </div>

        {/* Social proof row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: 'var(--color-muted)' }}>
          <span className="flex items-center gap-1.5"><span className="text-orange-400">★★★★★</span> 4.9/5 rating</span>
          <span className="h-3 w-px" style={{ background: 'var(--color-border)' }} />
          <span>Trusted in 40+ countries</span>
          <span className="h-3 w-px" style={{ background: 'var(--color-border)' }} />
          <span>Free to get started</span>
        </div>
      </section>

      {/* ── 2. STATS STRIP ──────────────────────────────────────────────── */}
      <section className="relative z-10 border-y px-8 py-12" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          <Stat value="12,000+" label="Scholarships indexed" />
          <Stat value="40+" label="Countries covered" />
          <Stat value="95%" label="Match accuracy" />
          <Stat value="Free" label="Always free tier" />
        </div>
      </section>

      {/* ── 3. FEATURES ─────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs uppercase tracking-widest text-orange-400">Features</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Everything you need to win funding</h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>No more manually browsing scholarship databases.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                icon: '🔍',
                title: 'AI-Powered Search',
                desc: 'DeepSeek + Tavily scans the web in real-time and returns scholarships matched specifically to your profile — not generic lists.',
              },
              {
                icon: '🎯',
                title: 'Precision Matching',
                desc: 'Filter by degree level, field of study, country of origin, and funding type. We surface what matters to you.',
              },
              {
                icon: '⏰',
                title: 'Deadline Alerts',
                desc: 'Set reminders for any opportunity. We send email alerts before deadlines so you never miss an application window.',
              },
              {
                icon: '📋',
                title: 'Application Tracking',
                desc: 'Save opportunities, mark them as applied, and track your progress all in one place.',
              },
              {
                icon: '🌍',
                title: 'Global Coverage',
                desc: 'Scholarships from the US, UK, EU, Asia, and beyond — for all degree levels including Masters, PhD, and Postdoc.',
              },
              {
                icon: '⚡',
                title: 'Instant Results',
                desc: 'No waiting. Search runs in seconds and results are structured, readable, and ranked by relevance.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass-card group p-6 transition-all hover:border-orange-500/30"
              >
                <div className="mb-3 text-2xl">{f.icon}</div>
                <h3 className="mb-1.5 text-sm font-semibold text-orange-400">{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ─────────────────────────────────────────────── */}
      <section id="how" className="relative z-10 border-t px-6 py-24" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs uppercase tracking-widest text-orange-400">How it works</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Up and running in 3 steps</h2>
          </div>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Complete your profile', desc: 'Tell us your degree level, field, country, and funding preference. Takes 2 minutes.' },
              { step: '02', title: 'Run an AI search', desc: 'PeakPath AI queries Tavily + DeepSeek to find real-time opportunities matched to your profile.' },
              { step: '03', title: 'Apply with confidence', desc: 'Review ranked results, save your favourites, and get email reminders before deadlines.' },
            ].map((s) => (
              <div
                key={s.step}
                className="flex items-start gap-6 rounded-xl border p-6 transition-all hover:border-orange-500/20"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
              >
                <span
                  className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold"
                  style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}
                >
                  {s.step}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. TESTIMONIALS ─────────────────────────────────────────────── */}
      <section id="testimonials" className="relative z-10 border-t px-6 py-24" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs uppercase tracking-widest text-orange-400">Reviews</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Scholars who found their path</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                quote: 'I found a fully-funded PhD scholarship in Germany in under 10 minutes. I\'d been searching manually for months.',
                name: 'Aisha M.',
                role: 'PhD Student, TU Berlin',
                country: '🇵🇰',
              },
              {
                quote: 'PeakPath matched me to a fellowship I had never heard of. It was tailored to my exact field — environmental engineering.',
                name: 'James O.',
                role: "Master's Candidate, UCL",
                country: '🇳🇬',
              },
              {
                quote: 'The deadline alerts alone saved my application. I almost missed a Chevening deadline — the email reminder caught it.',
                name: 'Sara K.',
                role: 'Undergraduate, University of Toronto',
                country: '🇮🇷',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="glass-card flex flex-col justify-between p-6"
              >
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-2xl">{t.country}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ──────────────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 border-t px-6 py-24" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto max-w-2xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs uppercase tracking-widest text-orange-400">FAQ</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Common questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Is PeakPath AI free to use?', a: 'Yes — you can run up to 5 searches per week for free. No credit card required.' },
              { q: 'What degree levels are supported?', a: 'Undergraduate, Masters, PhD, and Postdoc. We cover research fellowships too.' },
              { q: 'How is this different from Google?', a: 'PeakPath AI structures and ranks results based on your exact profile, not just keywords. You get a curated list, not 50 blue links.' },
              { q: 'Do you store my personal data?', a: 'Only your profile preferences (degree, field, country). We don\'t store search results or any sensitive information.' },
              { q: 'Can I apply through PeakPath AI?', a: 'Not yet — we link you directly to the official scholarship page. Application management is on the roadmap.' },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group glass-card overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-medium text-white list-none">
                  {faq.q}
                  <span className="ml-4 shrink-0 text-orange-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative z-10 border-t px-6 py-24 text-center" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,0.10) 0%, transparent 70%)' }}
        />
        <div className="relative mx-auto max-w-xl">
          <p className="mb-3 text-xs uppercase tracking-widest text-orange-400">Start today</p>
          <h2 className="text-4xl font-extrabold" style={{ fontFamily: 'Georgia, serif' }}>
            Your scholarship is<br />waiting to be found
          </h2>
          <p className="mt-4 text-sm" style={{ color: 'var(--color-muted)' }}>
            Join thousands of students using AI to unlock funding opportunities they never knew existed.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-orange-500 px-10 py-3.5 text-sm font-semibold text-white shadow-xl shadow-orange-900/30 transition-all hover:bg-orange-400 hover:scale-[1.03]"
          >
            Find my scholarships — it's free →
          </Link>
        </div>
      </section>

      {/* ── 8. FOOTER ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t px-8 py-8" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="rounded border border-orange-500/40 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-orange-400">
            Peak<span className="text-white">Path</span>
          </span>
          <div className="flex gap-6 text-xs" style={{ color: 'var(--color-muted)' }}>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-subtle)' }}>
            © {new Date().getFullYear()} PeakPath AI · Built for ambitious scholars
          </span>
        </div>
      </footer>
    </div>
  )
}
