'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchResidents } from '@/lib/api'
import { useCurrentUser } from '@/context/CurrentUser'
import type { Resident } from '@/lib/types'

type ResidentWithSkills = Resident & { skill?: { id: string }[] }

export default function LoginPage() {
  const router = useRouter()
  const { user, setUser } = useCurrentUser()
  const [residents, setResidents] = useState<ResidentWithSkills[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) router.replace('/')
  }, [user])

  useEffect(() => {
    fetchResidents().then(setResidents).finally(() => setIsLoading(false))
  }, [])

  function handleSelect(r: Resident) {
    setUser(r)
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-brand-700">Kijaide</h1>
          <p className="text-sm text-slate-600 mt-1">Qui es-tu pour cette démo ?</p>
        </div>

        <button
          onClick={() => router.push('/onboarding')}
          className="w-full py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors mb-4"
        >
          + Nouvel utilisateur
        </button>
        <p className="text-xs text-slate-500 text-center mb-4">ou connecte-toi en tant que</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {residents.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 bg-white border border-slate-300 rounded-xl px-4 py-3 hover:border-brand-400 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-bold text-brand-700 flex-shrink-0">
                  {r.first_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{r.first_name}</p>
                  <p className="text-xs text-slate-500">{r.city ?? '—'}</p>
                </div>
                <span className="text-xs text-brand-600 font-semibold flex-shrink-0">
                  {r.skill?.length ?? 0} compétence{(r.skill?.length ?? 0) !== 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
