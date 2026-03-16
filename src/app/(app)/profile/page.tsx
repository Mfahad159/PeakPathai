import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage() {
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        

        
        <div className="glass-card overflow-hidden p-8" style={{ background: 'var(--color-surface)' }}>
          <h1 className="text-3xl font-extrabold text-white leading-tight">
            My Profile
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>
            This is a mock Profile page created to demonstrate the global loader.
          </p>
        </div>

        <div className="glass-card p-8 text-zinc-300 leading-relaxed space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</p>
              <p className="mt-1 font-medium text-white">{profile?.full_name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</p>
              <p className="mt-1 font-medium text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Field of Study</p>
              <p className="mt-1 font-medium text-white">{profile?.field_of_study || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Degree Level</p>
              <p className="mt-1 font-medium text-white capitalize">{profile?.degree_level || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
