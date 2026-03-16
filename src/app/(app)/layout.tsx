import FloatingDock from '@/components/layout/FloatingDock'
import UserProfileButton from '@/components/layout/UserProfileButton'
import TopLeftLogo from '@/components/layout/TopLeftLogo'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Grid overlay — consistent with rest of app */}
      <div
        className="page-grid pointer-events-none fixed inset-0 z-0"
      />

      {/* Page content — pad top so top-navigation doesn't overlap content */}
      <main className="relative z-10 pt-28 pb-10">
        {children}
      </main>

      {/* Floating dock — only shown on authenticated app pages */}
      <FloatingDock />

      {/* Top right floating profile / signout */}
      <UserProfileButton />

      {/* Top left logo */}
      <TopLeftLogo />
    </div>
  )
}
