import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  let profileName = undefined
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    profileName = profile?.full_name
  }

  return (
    <div className="relative min-h-screen flex flex-col pt-16">
      <Navbar user={user} profileName={profileName} />
      
      {/* Page content */}
      <main className="relative z-10 flex-1">
        {children}
      </main>

      {/* Global Embedded Footer */}
      <Footer />
    </div>
  )
}
