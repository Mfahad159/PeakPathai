'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Design tokens from indie-starter.dev:
// bg: #0b0e1a | primary: orange-500 | card: bg-white/3 border-white/8 | grid overlay

// ─── Types ────────────────────────────────────────────────────────────────────
type DegreeLevel = 'undergraduate' | 'masters' | 'phd' | 'postdoc'
type FundingPreference = 'fully_funded' | 'partial' | 'any'

interface FormData {
  full_name: string
  degree_level: DegreeLevel | ''
  field_of_study: string
  country: string
  funding_preference: FundingPreference | ''
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const FIELDS_OF_STUDY = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Biology', 'Chemistry', 'Physics', 'Mathematics',
  'Economics', 'Business Administration', 'Psychology', 'Medicine',
  'Law', 'Political Science', 'Environmental Science',
]

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Sweden', 'Switzerland', 'Singapore',
  'Japan', 'South Korea', 'India', 'Pakistan', 'China', 'Brazil',
  'Saudi Arabia', 'UAE', 'New Zealand', 'Norway',
]

const DEGREE_OPTIONS: { value: DegreeLevel; label: string; desc: string }[] = [
  { value: 'undergraduate', label: 'Undergraduate', desc: "Bachelor's degree level" },
  { value: 'masters', label: "Master's", desc: 'Graduate / MSc / MBA' },
  { value: 'phd', label: 'PhD', desc: 'Doctoral research degree' },
  { value: 'postdoc', label: 'Postdoc', desc: 'Post-doctoral fellowship' },
]

const FUNDING_OPTIONS: { value: FundingPreference; label: string; desc: string }[] = [
  { value: 'fully_funded', label: 'Fully Funded', desc: 'Tuition + stipend covered' },
  { value: 'partial', label: 'Partial Funding', desc: 'Some costs covered' },
  { value: 'any', label: 'Any Funding', desc: 'Open to all options' },
]

const TOTAL_STEPS = 6

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100)
  return (
    <div className="mb-10">
      <div className="mb-2 flex items-center justify-between text-xs" style={{ color: 'var(--color-muted)' }}>
        <span>Step {step} of {TOTAL_STEPS}</span>
        <span>{pct}% complete</span>
      </div>
      <div className="h-1 w-full rounded-full" style={{ background: 'var(--color-border)' }}>
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'var(--color-primary)' }}
        />
      </div>
    </div>
  )
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{title}</h2>
      {subtitle && <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>}
    </div>
  )
}

function NavButtons({
  step, onBack, onNext, onFinish, loading, canNext,
}: {
  step: number
  onBack: () => void
  onNext: () => void
  onFinish: () => void
  loading: boolean
  canNext: boolean
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      {step > 1 ? (
        <button
          onClick={onBack}
          className="rounded-md border px-5 py-2.5 text-sm font-medium transition"
          style={{ borderColor: 'var(--color-border-strong)', color: 'var(--color-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-muted)')}
        >
          ← Back
        </button>
      ) : (
        <div />
      )}
      {step < TOTAL_STEPS ? (
        <button
          onClick={onNext}
          disabled={!canNext}
          className="rounded-md px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-primary)' }}
        >
          Continue →
        </button>
      ) : (
        <button
          onClick={onFinish}
          disabled={loading}
          className="rounded-md px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-primary)' }}
        >
          {loading ? 'Saving…' : 'Finish Setup ✓'}
        </button>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldSuggestions, setFieldSuggestions] = useState<string[]>([])
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([])
  const fieldRef = useRef<HTMLDivElement>(null)
  const countryRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState<FormData>({
    full_name: '',
    degree_level: '',
    field_of_study: '',
    country: '',
    funding_preference: '',
  })

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (fieldRef.current && !fieldRef.current.contains(e.target as Node))
        setFieldSuggestions([])
      if (countryRef.current && !countryRef.current.contains(e.target as Node))
        setCountrySuggestions([])
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const set = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  const canNext = (): boolean => {
    if (step === 1) return form.full_name.trim().length > 0
    if (step === 2) return form.degree_level !== ''
    if (step === 3) return form.field_of_study.trim().length > 0
    if (step === 4) return form.country.trim().length > 0
    if (step === 5) return form.funding_preference !== ''
    return true
  }

  const handleNext = () => {
    if (canNext()) setStep((s) => s + 1)
  }

  const handleFinish = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const degreeLabelMap: Record<DegreeLevel, string> = {
    undergraduate: 'Undergraduate',
    masters: "Master's",
    phd: 'PhD',
    postdoc: 'Postdoc',
  }

  const fundingLabelMap: Record<FundingPreference, string> = {
    fully_funded: 'Fully Funded',
    partial: 'Partial Funding',
    any: 'Any Funding',
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 overflow-hidden"
      style={{ background: 'var(--color-bg)' }}>

      {/* Grid overlay */}
      <div className="page-grid pointer-events-none absolute inset-0 z-0" />

      {/* Glow */}
      <div className="glow-blob" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded border border-orange-500/60 px-2 py-1 text-xs font-bold uppercase tracking-widest text-orange-400">
            Peak<span className="text-white">Path</span>
          </span>
          <p className="mt-2 text-xs" style={{ color: 'var(--color-muted)' }}>Let's personalise your experience</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <ProgressBar step={step} />

          {/* ── Step 1: Name ── */}
          {step === 1 && (
            <>
              <StepHeading title="What should we call you?" subtitle="Enter your full name as you'd like it displayed." />
              <input
                autoFocus
                type="text"
                placeholder="e.g. Ali Hassan"
                value={form.full_name}
                onChange={(e) => set('full_name', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                className="w-full rounded-md px-4 py-3 text-sm outline-none transition"
                style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </>
          )}

          {/* ── Step 2: Degree Level ── */}
          {step === 2 && (
            <>
              <StepHeading title="What's your degree level?" subtitle="Select the level you're applying for or currently studying." />
              <div className="grid grid-cols-2 gap-3">
                {DEGREE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => set('degree_level', opt.value)}
                    className="rounded-md p-4 text-left transition hover:scale-[1.02]"
                    style={{
                      border: `1px solid ${ form.degree_level === opt.value ? 'var(--color-primary)' : 'var(--color-border)' }`,
                      background: form.degree_level === opt.value ? 'var(--color-primary-muted)' : 'var(--color-surface-hover)',
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: form.degree_level === opt.value ? 'var(--color-primary)' : 'var(--color-text)' }}>{opt.label}</p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 3: Field of Study ── */}
          {step === 3 && (
            <>
              <StepHeading title="What's your field of study?" subtitle="Type or pick from common fields below." />
              <div ref={fieldRef} className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={form.field_of_study}
                  onChange={(e) => {
                    set('field_of_study', e.target.value)
                    const q = e.target.value.toLowerCase()
                    setFieldSuggestions(
                      q.length > 0
                        ? FIELDS_OF_STUDY.filter((f) => f.toLowerCase().includes(q)).slice(0, 5)
                        : []
                    )
                  }}
                  onFocus={() =>
                    setFieldSuggestions(
                      form.field_of_study.length === 0 ? FIELDS_OF_STUDY.slice(0, 6) : []
                    )
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full rounded-md px-4 py-3 text-sm outline-none transition"
                  style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                {fieldSuggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md shadow-xl" style={{ background: '#13172a', border: '1px solid var(--color-border)' }}>
                    {fieldSuggestions.map((s) => (
                      <li
                        key={s}
                        onClick={() => {
                          set('field_of_study', s)
                          setFieldSuggestions([])
                        }}
                        className="cursor-pointer px-4 py-2.5 text-sm transition"
                        style={{ color: 'var(--color-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.background = 'var(--color-primary-muted)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.background = 'transparent' }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {/* ── Step 4: Country ── */}
          {step === 4 && (
            <>
              <StepHeading title="Which country are you based in?" subtitle="The country you're applying from." />
              <div ref={countryRef} className="relative">
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Pakistan"
                  value={form.country}
                  onChange={(e) => {
                    set('country', e.target.value)
                    const q = e.target.value.toLowerCase()
                    setCountrySuggestions(
                      q.length > 0
                        ? COUNTRIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 6)
                        : []
                    )
                  }}
                  onFocus={() =>
                    setCountrySuggestions(
                      form.country.length === 0 ? COUNTRIES.slice(0, 6) : []
                    )
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  className="w-full rounded-md px-4 py-3 text-sm outline-none transition"
                  style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                {countrySuggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md shadow-xl" style={{ background: '#13172a', border: '1px solid var(--color-border)' }}>
                    {countrySuggestions.map((c) => (
                      <li
                        key={c}
                        onClick={() => {
                          set('country', c)
                          setCountrySuggestions([])
                        }}
                        className="cursor-pointer px-4 py-2.5 text-sm transition"
                        style={{ color: 'var(--color-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.background = 'var(--color-primary-muted)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.background = 'transparent' }}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {/* ── Step 5: Funding Preference ── */}
          {step === 5 && (
            <>
              <StepHeading title="What's your funding preference?" subtitle="We'll prioritise opportunities matching this." />
              <div className="flex flex-col gap-3">
                {FUNDING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => set('funding_preference', opt.value)}
                    className="rounded-md p-4 text-left transition hover:scale-[1.01]"
                    style={{
                      border: `1px solid ${ form.funding_preference === opt.value ? 'var(--color-primary)' : 'var(--color-border)' }`,
                      background: form.funding_preference === opt.value ? 'var(--color-primary-muted)' : 'var(--color-surface-hover)',
                    }}
                  >
                    <p className="text-sm font-semibold" style={{ color: form.funding_preference === opt.value ? 'var(--color-primary)' : 'var(--color-text)' }}>{opt.label}</p>
                    <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 6: Review ── */}
          {step === 6 && (
            <>
              <StepHeading title="Review your profile" subtitle="Everything look good? You can edit before finishing." />
              <div className="space-y-3">
                {[
                  { label: 'Full Name', value: form.full_name, editStep: 1 },
                  {
                    label: 'Degree Level',
                    value: form.degree_level ? degreeLabelMap[form.degree_level as DegreeLevel] : '',
                    editStep: 2,
                  },
                  { label: 'Field of Study', value: form.field_of_study, editStep: 3 },
                  { label: 'Country', value: form.country, editStep: 4 },
                  {
                    label: 'Funding Preference',
                    value: form.funding_preference ? fundingLabelMap[form.funding_preference as FundingPreference] : '',
                    editStep: 5,
                  },
                ].map(({ label, value, editStep }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-xs text-zinc-500">{label}</p>
                      <p className="mt-0.5 text-sm font-medium text-white">{value}</p>
                    </div>
                    <button
                      onClick={() => setStep(editStep)}
                      className="text-xs text-violet-400 hover:text-violet-300 transition"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
              {error && (
                <div className="mt-4 rounded-md px-4 py-3 text-xs" style={{ border: '1px solid var(--color-error-border)', background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
                  {error}
                </div>
              )}
            </>
          )}

          <NavButtons
            step={step}
            onBack={() => setStep((s) => s - 1)}
            onNext={handleNext}
            onFinish={handleFinish}
            loading={loading}
            canNext={canNext()}
          />
        </div>
      </div>
    </div>
  )
}
