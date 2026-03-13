import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user.email}!</p>
      <div className="mt-8">
          <form action="/api/auth/signout" method="post">
              <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-md">
                  Sign Out
              </button>
          </form>
      </div>
    </div>
  )
}
