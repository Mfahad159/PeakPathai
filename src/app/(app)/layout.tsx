import FloatingDock from '@/components/layout/FloatingDock'
import UserProfileButton from '@/components/layout/UserProfileButton'
import TopLeftLogo from '@/components/layout/TopLeftLogo'
import Footer from '@/components/layout/Footer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Page content — pad top/bottom responsively so navigation doesn't overlap content */}
      <main className="relative z-10 pb-28 pt-20 md:pb-10 md:pt-28 flex-1">
        {children}
      </main>

      {/* Global Embedded Footer */}
      <Footer />

      {/* Floating dock — only shown on authenticated app pages */}
      <FloatingDock />

      {/* Top right floating profile / signout */}
      <UserProfileButton />

      {/* Top left logo */}
      <TopLeftLogo />
    </div>
  )
}
