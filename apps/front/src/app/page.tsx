'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchSkills } from '@/lib/api'
import { CATEGORIES } from '@/constants/categories'
import ServiceExplorer from '@/components/services/ServiceExplorer'
import { useCurrentUser } from '@/context/CurrentUser'
import type { Skill, Resident } from '@/lib/types'

function HomeFeed({ user }: { user: Resident }) {
  const router = useRouter()
  const { setUser } = useCurrentUser()
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const userId = user.id
  useEffect(() => {
    fetchSkills()
      .then((all) => setSkills(all.filter((s: Skill) => s.resident_id !== userId)))
      .finally(() => setIsLoading(false))
  }, [userId])

  const userLat = user.lat ?? null
  const userLng = user.lng ?? null

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Kijaide</h1>
          <p className="text-sm text-gray-500">Pays de Landivisiau</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a href="/skills" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
            Mes compétences
          </a>
          <a href="/exchanges" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
            Mes échanges
          </a>
          <a href="/profile" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
            Mon profil
          </a>
          <button
            onClick={() => { setUser(null); router.push('/login') }}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
              {user.first_name[0]}
            </div>
            <span className="text-xs text-gray-600">{user.first_name}</span>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ServiceExplorer
            initialSkills={skills}
            categories={CATEGORIES}
            userLat={userLat}
            userLng={userLng}
          />
        )}
      </div>
    </main>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { user } = useCurrentUser()

  useEffect(() => {
    if (!user) router.replace('/login')
  }, [user, router])

  if (!user) return null
  return <HomeFeed user={user} />
}
