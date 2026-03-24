'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES, CategoryId, SubcatId } from '@/constants/categories'
import { fetchResidentSkills, saveResidentSkills } from '@/lib/api'
import { useCurrentUser } from '@/context/CurrentUser'

type SkillsState = Partial<Record<CategoryId, SubcatId[]>>
type CommentsState = Partial<Record<string, string>> // `${CategoryId}:${SubcatId}` → comment

function buildState(skills: Array<{ category: string; subcategory: string | null; comment: string | null }>) {
  const selected: SkillsState = {}
  const comments: CommentsState = {}
  for (const skill of skills) {
    if (!skill.subcategory) continue
    const catId = skill.category as CategoryId
    const subcatId = skill.subcategory as SubcatId
    if (!selected[catId]) selected[catId] = []
    selected[catId]!.push(subcatId)
    if (skill.comment) comments[`${catId}:${subcatId}`] = skill.comment
  }
  return { selected, comments }
}

export default function SkillsPage() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [selected, setSelected] = useState<SkillsState>({})
  const [comments, setComments] = useState<CommentsState>({})
  const [initial, setInitial] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchResidentSkills(user.id)
      .then((skills) => {
        const state = buildState(skills)
        setSelected(state.selected)
        setComments(state.comments)
        setInitial(JSON.stringify(state))
      })
      .finally(() => setIsLoading(false))
  })

  const isDirty = JSON.stringify({ selected, comments }) !== initial

  function toggle(catId: CategoryId, subcatId: SubcatId) {
    setSelected((prev) => {
      const current = prev[catId] ?? []
      return {
        ...prev,
        [catId]: current.includes(subcatId)
          ? current.filter((s) => s !== subcatId)
          : [...current, subcatId],
      }
    })
    setSaved(false)
  }

  function setComment(catId: CategoryId, subcatId: SubcatId, value: string) {
    setComments((prev) => ({ ...prev, [`${catId}:${subcatId}`]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setIsSaving(true)
    const skills = (Object.entries(selected) as [CategoryId, SubcatId[]][]).flatMap(
      ([catId, subcats]) =>
        subcats.map((subcatId) => ({
          category: catId,
          subcategory: subcatId,
          comment: comments[`${catId}:${subcatId}`] ?? null,
        }))
    )
    try {
      await saveResidentSkills(user!.id, skills)
      setInitial(JSON.stringify({ selected, comments }))
      setSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-4 py-4 flex items-center gap-3 sticky top-0 bg-white z-10">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Retour
        </button>
        <h1 className="text-base font-medium text-gray-900 flex-1">Mes compétences</h1>
        {isDirty && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-sm text-emerald-600 font-medium hover:text-emerald-700 disabled:opacity-50"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        )}
        {!isDirty && saved && (
          <span className="text-sm text-gray-400">✓ Enregistré</span>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {CATEGORIES.map((cat) => {
              const catSelected = selected[cat.id] ?? []
              return (
                <div key={cat.id} className="py-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    {cat.emoji} {cat.label}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {cat.subcategories.map((sub) => {
                      const active = catSelected.includes(sub.id as SubcatId)
                      return (
                        <button
                          key={sub.id}
                          onClick={() => toggle(cat.id, sub.id as SubcatId)}
                          className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                            active
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {sub.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Commentaires pour les chips actifs */}
                  {cat.subcategories
                    .filter((sub) => catSelected.includes(sub.id as SubcatId))
                    .map((sub) => (
                      <div key={sub.id} className="mb-2">
                        <label className="text-xs text-gray-400 block mb-1">{sub.label}</label>
                        <input
                          type="text"
                          value={comments[`${cat.id}:${sub.id}`] ?? ''}
                          onChange={(e) => setComment(cat.id, sub.id as SubcatId, e.target.value)}
                          placeholder="Ajouter un détail... (facultatif)"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
