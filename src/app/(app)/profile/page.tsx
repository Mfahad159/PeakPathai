'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Check, Edit2, LogOut, Loader2, AlertCircle, X } from 'lucide-react'

const COUNTRIES = [
  "Global", "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Netherlands", "Sweden", "Switzerland", "Japan", "South Korea", 
  "Singapore", "China", "New Zealand", "Ireland", "Italy", "Spain", "Norway", 
  "Denmark", "Finland", "Austria", "Belgium"
]

const DEGREE_LEVELS = ['Undergraduate', 'Masters', 'PhD', 'Postdoc']
const FUNDING_PREFS = [
  { value: 'any', label: 'Any Funding Type' },
  { value: 'fully_funded', label: 'Fully Funded Only' },
  { value: 'partial', label: 'Partial Funding Accepted' },
  { value: 'research_fellowship', label: 'Research Fellowship / Stipend' },
]

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail] = useState<string>('')
  
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState<{ field: string, message: string } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email ?? '')
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleEdit = (field: string, currentValue: string) => {
    setSaveError(null)
    setEditingField(field)
    setEditValue(currentValue || '')
  }

  const handleSave = async (field: string) => {
    if (editingField !== field) return
    
    setSaveLoading(true)
    setSaveError(null)

    try {
      const res = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: editValue }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update')
      
      setProfile((prev: any) => ({ ...prev, ...data.updates }))
      setEditingField(null)
    } catch (err: any) {
      setSaveError({ field, message: err.message })
    } finally {
      setSaveLoading(false)
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const renderEditableField = (label: string, field: string, type: 'text' | 'select' = 'text', options?: any[]) => {
    const isEditing = editingField === field
    const value = profile?.[field]
    const hasError = saveError?.field === field

    return (
      <div className="group relative rounded-xl border p-4 transition-all hover:border-white/20" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{label}</p>
        
        {isEditing ? (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-3">
              {type === 'select' ? (
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  disabled={saveLoading}
                  className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none disabled:opacity-50 [&>option]:bg-[#0b0e1a]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <option value="" disabled>Select {label}</option>
                  {options?.map(opt => {
                    const val = typeof opt === 'string' ? opt : opt.value
                    const lbl = typeof opt === 'string' ? opt : opt.label
                    return <option key={val} value={val}>{lbl}</option>
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  disabled={saveLoading}
                  className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none disabled:opacity-50"
                  style={{ borderColor: 'var(--color-border)' }}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSave(field)}
                />
              )}
              
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => handleSave(field)}
                  disabled={saveLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-50"
                >
                  {saveLoading ? <span className="text-xs font-bold">...</span> : <Check className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { setEditingField(null); setSaveError(null) }}
                  disabled={saveLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {hasError && (
              <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1">
                <AlertCircle className="h-3 w-3" />
                {saveError.message}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-white">
              {field === 'funding_preference' ? Object.values(FUNDING_PREFS).find(f => f.value === value)?.label || value : value}
            </p>
            <button
              onClick={() => handleEdit(field, value)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 opacity-0 transition-all hover:bg-white/5 hover:text-white group-hover:opacity-100 focus:opacity-100"
              aria-label={`Edit ${label}`}
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-10 px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>Your Profile</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>Manage your personal information and search preferences.</p>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="rounded-xl border p-6" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <div className="h-4 w-32 bg-white/10 rounded mb-4" />
              <div className="h-10 w-full bg-white/5 rounded" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-6 h-24" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}></div>
              <div className="rounded-xl border p-6 h-24" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}></div>
              <div className="rounded-xl border p-6 h-24" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}></div>
              <div className="rounded-xl border p-6 h-24" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}></div>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
            
            {/* Account Info */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Account Basics</h2>
              
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Email Address</p>
                <div className="flex items-center justify-between">
                  <p className="text-base font-medium text-zinc-400">{email}</p>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase font-bold text-zinc-500">Read Only</span>
                </div>
              </div>

              {renderEditableField('Full Name', 'full_name')}
            </section>

            {/* Academic Profile */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Academic Details</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {renderEditableField('Degree Level', 'degree_level', 'select', DEGREE_LEVELS)}
                {renderEditableField('Field of Study', 'field_of_study')}
                {renderEditableField('Citizenship / Country', 'country', 'select', COUNTRIES)}
                {renderEditableField('Funding Preference', 'funding_preference', 'select', FUNDING_PREFS)}
              </div>
            </section>

            {/* Danger Zone */}
            <section className="mt-12 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
              <h2 className="mb-2 text-lg font-semibold text-red-400">Danger Zone</h2>
              <p className="mb-6 text-sm text-zinc-400">Signing out will terminate your current active session securely.</p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500 hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </section>

          </motion.div>
        )}

      </div>
    </div>
  )
}
