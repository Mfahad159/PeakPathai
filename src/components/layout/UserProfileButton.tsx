'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function UserProfileButton() {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url)
      }
    }
    loadUser()
  }, [])

  if (!avatarUrl) return null

  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
      <div 
        className="flex items-center gap-3 overflow-hidden rounded-full border border-white/10 p-1.5 shadow-lg transition-all duration-300"
        style={{
          background: 'rgba(11,14,26,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* User Avatar */}
        <div className="relative h-9 w-9 overflow-hidden rounded-full bg-zinc-800 shrink-0">
          <Image 
            src={avatarUrl} 
            alt="User Profile" 
            fill
            unoptimized
            className="object-cover"
          />
        </div>

        {/* Sign Out Action */}
        <form action="/api/auth/signout" method="post" className="flex items-center mr-2">
          <button
            type="submit"
            className="group flex flex-col items-center justify-center p-1"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Sign out"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-5 w-5 transition-colors duration-200"
              style={{ color: isHovered ? 'var(--color-primary)' : 'var(--color-muted)' }}
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
