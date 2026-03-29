'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchSkills, fetchResidents } from '@/lib/api'
import { CATEGORIES } from '@/constants/categories'
import ServiceExplorer from '@/components/services/ServiceExplorer'
import ServiceList from '@/components/services/ServiceList'
import { useCurrentUser } from '@/context/CurrentUser'
import type { Skill, Resident } from '@/lib/types'

function HomeFeed({ user }: { user: Resident }) {
  const router = useRouter()
  const { setUser } = useCurrentUser()
  const [skills, setSkills] = useState<Skill[]>([])
  const [matchedSkills, setMatchedSkills] = useState<Skill[]>([])
  const [residentCount, setResidentCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const userId = user.id
  const userLat = user.lat ?? null
  const userLng = user.lng ?? null

  useEffect(() => {
    Promise.all([
      fetchResidents(),
      fetchSkills(),
      fetchSkills({ match_resident_id: userId }),
    ]).then(([allResidents, allSkills, matched]) => {
      const matchedFiltered = matched.filter((s: Skill) => s.resident_id !== userId)
      const matchedIds = new Set(matchedFiltered.map((s: Skill) => s.id))
      setResidentCount(allResidents.length)
      setMatchedSkills(matchedFiltered)
      setSkills(allSkills.filter((s: Skill) => s.resident_id !== userId && !matchedIds.has(s.id)))
    }).finally(() => setIsLoading(false))
  }, [userId])

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg font-semibold text-gray-900">Kijaide</span>
            <span className="hidden sm:inline text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
              Pays de Landivisiau
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <a href="/exchanges" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Mes échanges
            </a>
            <a href="/profile" className="text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Mon profil
            </a>
            <button
              onClick={() => { setUser(null); router.push('/login') }}
              className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 hover:border-gray-300 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                {user.first_name[0]}
              </div>
              <span className="hidden sm:inline text-xs text-gray-600">{user.first_name}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* Compteur résidents */}
        {residentCount !== null && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">🤝</span>
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                {residentCount} voisin{residentCount > 1 ? 's' : ''} proposent leur aide près de chez toi
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Découvre leurs compétences et propose les tiennes.
              </p>
            </div>
            <div className="ml-auto hidden sm:flex gap-2 flex-shrink-0">
              <a
                href="/profile?tab=competences"
                className="text-xs font-medium text-emerald-700 border border-emerald-300 rounded-lg px-3 py-1.5 hover:bg-emerald-100 transition-colors"
              >
                Mes compétences
              </a>
              <a
                href="/profile?tab=interests"
                className="text-xs font-medium text-emerald-700 border border-emerald-300 rounded-lg px-3 py-1.5 hover:bg-emerald-100 transition-colors"
              >
                Mes intérêts
              </a>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Section matches intérêts */}
            {matchedSkills.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  Voisins qui peuvent vous apprendre
                </h2>
                <ServiceList
                  services={matchedSkills}
                  isPending={false}
                  userLat={userLat}
                  userLng={userLng}
                  highlighted
                />
              </div>
            )}

            {/* Catalogue complet */}
            <ServiceExplorer
              initialSkills={skills}
              categories={CATEGORIES}
              userLat={userLat}
              userLng={userLng}
            />
          </>
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
