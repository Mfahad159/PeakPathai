'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function LoaderContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPath, setCurrentPath] = useState(pathname)

  // Determine if a route change is happening
  useEffect(() => {
    if (pathname !== currentPath) {
      // The path has finally changed, stop loading
      setIsLoading(false)
      setCurrentPath(pathname)
    }
  }, [pathname, searchParams, currentPath])

  // Attach a global click listener to catch Next.js <Link> clicks 
  // before the route actually begins transitioning on the server.
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      
      const href = target.getAttribute('href')
      if (!href) return

      // Only trigger loader for internal route transitions
      if (
        href.startsWith('/') && 
        href !== pathname && 
        !target.hasAttribute('download') && 
        target.getAttribute('target') !== '_blank'
      ) {
        setIsLoading(true)
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => document.removeEventListener('click', handleAnchorClick, true)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#050505]/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative flex flex-col items-center justify-center">
        {/* Animated Theme Bar (Left to Right / Right to Left) */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-12 w-48 overflow-hidden rounded-full bg-white/5 shadow-inner">
            <div className="h-full w-1/2 rounded-full bg-orange-500/30 blur-md animate-ping-pong" />
          </div>
        </div>

        {/* Pulsing PeakPath Text */}
        <h1 
          className="animate-fade-in-out z-10 text-3xl font-extrabold tracking-tight text-white drop-shadow-2xl m-0 p-20 text-center" 
          style={{ fontFamily: 'Georgia, serif' }}
        >
          PeakPath<span className="text-orange-500">.</span>
        </h1>
      </div>
    </div>
  )
}

export default function GlobalLoader() {
  return (
    <Suspense fallback={null}>
      <LoaderContent />
    </Suspense>
  )
}
