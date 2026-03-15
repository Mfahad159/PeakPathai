import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, degree_level, field_of_study, country')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Scholar'

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-bold" style={{ color: 'var(--color-text)', fontFamily: 'Georgia, serif' }}>
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
            {profile?.field_of_study ?? 'Your field'} · {profile?.country ?? 'Your country'} · {profile?.degree_level ?? '—'}
          </p>
        </div>

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Opportunities Found', value: '—', sub: 'Run a search to get started' },
            { label: 'Saved', value: '0', sub: 'Bookmarked opportunities' },
            { label: 'Searches This Week', value: '0 / 5', sub: 'Weekly quota' },
          ].map((card) => (
            <div
              key={card.label}
              className="glass-card p-5"
            >
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{card.label}</p>
              <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{card.value}</p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--color-subtle)' }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 glass-card p-8 text-center">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>Phase 2 coming soon</p>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>AI Search is on the way</h2>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            Your profile is ready. In Phase 2, PeakPath AI will use your preferences to surface matching scholarships automatically.
          </p>
        </div>

      </div>
    </div>
  )
}
