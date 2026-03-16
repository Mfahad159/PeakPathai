'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Menu, X, LogOut, Search, User as UserIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  user: User | null
  profileName?: string
}

export default function Navbar({ user, profileName }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  const displayName = profileName?.split(' ')[0] || user?.email?.split('@')[0] || 'Scholar'

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <Search className="w-4 h-4" /> },
    { href: '/profile', label: 'Profile', icon: <UserIcon className="w-4 h-4" /> },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0b0e1a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex shrink-0 items-center">
          <Link href="/dashboard" className="flex items-baseline font-sans tracking-tight transition-transform hover:scale-[1.02]">
            <span className="text-xl font-black text-white">PEAK</span>
            <span className="text-xl font-light text-orange-500">PATH</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-orange-400' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white">{displayName}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center rounded-full bg-white/5 p-2 text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-400"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-zinc-400 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-[#0b0e1a]"
          >
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors ${
                      isActive 
                        ? 'bg-orange-500/10 text-orange-400' 
                        : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                )
              })}
              
              <div className="my-2 h-px w-full bg-white/10" />
              
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-medium text-zinc-400">Signed in as {displayName}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
