import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import OpportunityCard from '@/components/opportunity/OpportunityCard'

export default async function ExplorePage() {
  // Simulate network delay to trigger loader
  await new Promise((resolve) => setTimeout(resolve, 800))

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch some random recent opportunities (mock explore feed)
  const { data: globalOpps } = await supabase
    .from('opportunities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        

        
        <div>
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            Explore Global Feed
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            Discover recent opportunities found by other PeakPath users across the world.
          </p>
        </div>

        {globalOpps && globalOpps.length > 0 ? (
          <div className="grid gap-4 mt-6 sm:grid-cols-2">
            {globalOpps.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        ) : (
          <div className="glass-card mt-6 p-8 text-center text-zinc-500">
             No recent global opportunities found right now.
          </div>
        )}

      </div>
    </div>
  )
}
