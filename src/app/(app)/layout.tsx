import FloatingDock from '@/components/layout/FloatingDock'
import UserProfileButton from '@/components/layout/UserProfileButton'
import TopLeftLogo from '@/components/layout/TopLeftLogo'
import Footer from '@/components/layout/Footer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen pb-24 md:pb-0 pt-0">
      <TopLeftLogo />
      <UserProfileButton />
      <FloatingDock />
      
      {/* Page content */}
      <main className="relative z-10 mx-auto max-w-7xl">
        {children}
      </main>

      {/* Global Embedded Footer */}
      <Footer />
    </div>
  )
}
