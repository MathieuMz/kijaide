'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCurrentUser } from '@/context/CurrentUser'
import type { Resident } from '@/lib/types'
import InfosTab from './InfosTab'
import CompetencesTab from './CompetencesTab'
import InterestsTab from './InterestsTab'

enum Tab {
  Competences = 'competences',
  Interests   = 'interests',
  Infos       = 'infos',
}

const TAB_LABEL: Record<Tab, string> = {
  [Tab.Competences]: 'Mes compétences',
  [Tab.Interests]:   'Mes intérêts',
  [Tab.Infos]:       'Mes infos',
}

function ProfilePage({ user, setUser }: { user: Resident; setUser: (u: Resident | null) => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab | null) ?? Tab.Competences
  const [tab, setTab] = useState<Tab>(initialTab)

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-300 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="text-slate-500 hover:text-slate-600 text-sm">
          ← Retour
        </button>
        <h1 className="text-base font-semibold text-slate-900">Mon profil</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex rounded-xl border border-slate-300 overflow-hidden mb-5">
          {([Tab.Competences, Tab.Interests, Tab.Infos]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>

        {tab === Tab.Infos        && <InfosTab user={user} setUser={setUser} />}
        {tab === Tab.Competences  && <CompetencesTab user={user} />}
        {tab === Tab.Interests    && <InterestsTab user={user} />}
      </div>
    </main>
  )
}

export default function ProfilePageWrapper() {
  const { user, setUser } = useCurrentUser()
  if (!user) return null
  return <ProfilePage user={user} setUser={setUser} />
}
