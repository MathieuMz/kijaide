'use client'

import { useState, useEffect } from 'react'
import { fetchResidentInterests, saveResidentInterests } from '@/lib/api'
import { CATEGORIES, CategoryId, AUTRE_SUBCAT_ID } from '@/constants/categories'
import type { Resident } from '@/lib/types'

type InterestsState = Partial<Record<CategoryId, string[]>> // catId → subcatIds sélectionnés (vide = toute la catégorie)

function buildState(interests: Array<{ category: string; subcategory: string | null }>) {
  const state: InterestsState = {}
  for (const i of interests) {
    const catId = i.category as CategoryId
    if (!state[catId]) state[catId] = []
    if (i.subcategory) state[catId]!.push(i.subcategory)
  }
  return state
}

export default function InterestsTab({ user }: { user: Resident }) {
  const [interests, setInterests] = useState<InterestsState>({})
  const [initial, setInitial] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchResidentInterests(user.id).then(data => {
      const state = buildState(data)
      setInterests(state)
      setInitial(JSON.stringify(state))
    }).finally(() => setIsLoading(false))
  }, [user.id])

  const isDirty = JSON.stringify(interests) !== initial

  function toggleCat(catId: CategoryId) {
    setInterests(prev => {
      const next = { ...prev }
      if (catId in next) {
        delete next[catId]
      } else {
        next[catId] = []
      }
      return next
    })
    setSaved(false)
  }

  function toggleSubcat(catId: CategoryId, subcatId: string) {
    setInterests(prev => {
      const current = prev[catId] ?? []
      return {
        ...prev,
        [catId]: current.includes(subcatId)
          ? current.filter(s => s !== subcatId)
          : [...current, subcatId],
      }
    })
    setSaved(false)
  }

  async function handleSave() {
    setIsSaving(true)
    const payload = (Object.entries(interests) as [CategoryId, string[]][]).flatMap(
      ([catId, subcats]): Array<{ category: string; subcategory: string | null }> => {
        if (subcats.length === 0) return [{ category: catId as string, subcategory: null }]
        return subcats.map(subcatId => ({ category: catId as string, subcategory: subcatId }))
      }
    )
    try {
      await saveResidentInterests(user.id, payload)
      setInitial(JSON.stringify(interests))
      setSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <p className="text-sm text-gray-400">Chargement...</p>

  const selectedCats = Object.keys(interests) as CategoryId[]

  return (
    <div>
      <p className="text-xs text-gray-400 mb-4">
        Sélectionne ce que tu aimerais apprendre ou recevoir. Tu seras notifié quand un voisin propose quelque chose qui t&apos;intéresse.
      </p>

      {/* Chips catégories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => {
          const active = cat.id in interests
          return (
            <button
              key={cat.id}
              onClick={() => toggleCat(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                active
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Affinement par sous-catégorie */}
      {selectedCats.length > 0 && (
        <div className="space-y-5 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Affine tes intérêts (facultatif)
          </p>
          {selectedCats.map(catId => {
            const cat = CATEGORIES.find(c => c.id === catId)!
            const subcats = cat.subcategories.filter(s => s.id !== AUTRE_SUBCAT_ID)
            const activeSubs = interests[catId] ?? []
            return (
              <div key={catId}>
                <p className="text-xs font-medium text-gray-500 mb-2">{cat.emoji} {cat.label}</p>
                <div className="flex flex-wrap gap-2">
                  {subcats.map(sub => {
                    const active = activeSubs.includes(sub.id)
                    return (
                      <button
                        key={sub.id}
                        onClick={() => toggleSubcat(catId, sub.id)}
                        className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                          active
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {sub.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving || !isDirty}
        className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm disabled:opacity-40 hover:bg-emerald-600 transition-all"
      >
        {isSaving ? 'Enregistrement...' : saved && !isDirty ? '✓ Enregistré' : 'Enregistrer'}
      </button>
    </div>
  )
}
