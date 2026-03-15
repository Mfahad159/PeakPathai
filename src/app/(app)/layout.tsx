import FloatingDock from '@/components/layout/FloatingDock'

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

      {/* Page content — pad bottom so dock doesn't overlap content */}
      <main className="relative z-10 pb-24">
        {children}
      </main>

      {/* Floating dock — only shown on authenticated app pages */}
      <FloatingDock />
    </div>
  )
}
