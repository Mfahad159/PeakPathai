'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/explore',
    label: 'Explore',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

export default function FloatingDock() {
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <nav
        className="flex items-center gap-1 rounded-2xl border px-3 py-2 shadow-2xl"
        style={{
          background: 'rgba(13,16,30,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        {NAV_ITEMS.map((item, i) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const isHovered = hoveredIndex === i

          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all duration-200"
              style={{
                background: isActive
                  ? 'rgba(249,115,22,0.15)'
                  : isHovered
                  ? 'rgba(255,255,255,0.06)'
                  : 'transparent',
                color: isActive
                  ? 'var(--color-primary)'
                  : isHovered
                  ? 'var(--color-text)'
                  : 'var(--color-muted)',
              }}
            >
              {item.icon}

              {/* Label — expands on hover */}
              <span
                className="overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-200"
                style={{
                  maxWidth: isActive || isHovered ? '80px' : '0px',
                  opacity: isActive || isHovered ? 1 : 0,
                }}
              >
                {item.label}
              </span>

              {/* Active dot indicator */}
              {isActive && !isHovered && (
                <span
                  className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                />
              )}
            </Link>
          )
        })}

      </nav>
    </div>
  )
}
