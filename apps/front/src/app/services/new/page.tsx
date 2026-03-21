'use client'

import { useEffect, useState } from 'react'
import { fetchResident, fetchResidentSkills } from '@/lib/api'
import { DEMO_RESIDENT_ID } from '@/constants/demo'
import type { Resident } from '@/lib/types'
import NewServiceForm from '../NewServiceForm'

export default function NewServicePage() {
  const [resident, setResident] = useState<Resident | null>(null)
  const [skills, setSkills] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchResident(DEMO_RESIDENT_ID),
      fetchResidentSkills(DEMO_RESIDENT_ID),
    ]).then(([r, s]) => {
      setResident(r)
      setSkills(s)
    }).finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (!resident) return null

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <a href="/" className="text-gray-400 hover:text-gray-600 text-sm">
          ← Retour
        </a>
        <h1 className="text-base font-medium text-gray-900">
          Proposer un service
        </h1>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <NewServiceForm resident={resident} skills={skills} />
      </div>
    </main>
  )
}