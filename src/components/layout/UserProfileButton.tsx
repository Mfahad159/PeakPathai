'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function UserProfileButton() {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url)
      }
    }
    loadUser()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!avatarUrl) return null

  return (
    <div className="fixed top-6 right-6 z-50" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-11 w-11 overflow-hidden rounded-full border border-white/10 shadow-lg transition-transform hover:scale-105"
        style={{
          boxShadow: isOpen ? '0 0 0 2px var(--color-primary)' : '0 4px 12px rgba(0,0,0,0.5)'
        }}
      >
        <Image 
          src={avatarUrl} 
          alt="User Profile" 
          fill
          unoptimized
          className="object-cover"
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-3 w-48 overflow-hidden rounded-xl border py-1 shadow-2xl origin-top-right animate-in fade-in zoom-in-95 duration-200"
          style={{
            background: 'var(--color-surface)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <form action="/api/auth/signout" method="post" className="w-full text-left">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5 text-red-400 hover:text-red-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
