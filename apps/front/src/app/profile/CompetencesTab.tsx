'use client'

import { useState, useEffect } from 'react'
import { fetchResidentSkills, saveResidentSkills } from '@/lib/api'
import { CATEGORIES, CategoryId, SubcatId, AUTRE_SUBCAT_ID } from '@/constants/categories'
import type { Resident } from '@/lib/types'

type SkillsState = Partial<Record<CategoryId, SubcatId[]>>
type CommentsState = Partial<Record<string, string>>

function buildState(skills: Array<{ category: string; subcategory: string | null; comment: string | null }>) {
  const selected: SkillsState = {}
  const comments: CommentsState = {}
  for (const skill of skills) {
    if (!skill.subcategory) continue
    const catId = skill.category as CategoryId
    const subcatId = skill.subcategory as SubcatId
    if (!selected[catId]) selected[catId] = []
    selected[catId]!.push(subcatId)
    if (skill.comment) {
      if (subcatId === AUTRE_SUBCAT_ID) {
        const [title, desc] = skill.comment.split('\n')
        comments[`${catId}:${AUTRE_SUBCAT_ID}`] = title ?? ''
        if (desc) comments[`${catId}:${AUTRE_SUBCAT_ID}:desc`] = desc
      } else {
        comments[`${catId}:${subcatId}`] = skill.comment
      }
    }
  }
  return { selected, comments }
}

export default function CompetencesTab({ user }: { user: Resident }) {
  const [selected, setSelected] = useState<SkillsState>({})
  const [comments, setComments] = useState<CommentsState>({})
  const [initial, setInitial] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchResidentSkills(user.id).then(skills => {
      const state = buildState(skills)
      setSelected(state.selected)
      setComments(state.comments)
      setInitial(JSON.stringify(state))
    }).finally(() => setIsLoading(false))
  }, [user.id])

  const isDirty = JSON.stringify({ selected, comments }) !== initial

  function toggle(catId: CategoryId, subcatId: SubcatId) {
    setSelected(prev => {
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

  function setComment(key: string, value: string) {
    setComments(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setIsSaving(true)
    const skills = (Object.entries(selected) as [CategoryId, SubcatId[]][]).flatMap(
      ([catId, subcats]) =>
        subcats.map(subcatId => {
          if (subcatId === AUTRE_SUBCAT_ID) {
            const title = comments[`${catId}:${AUTRE_SUBCAT_ID}`] ?? ''
            const desc = comments[`${catId}:${AUTRE_SUBCAT_ID}:desc`] ?? ''
            return {
              category: catId,
              subcategory: subcatId,
              comment: desc ? `${title}\n${desc}` : title,
            }
          }
          return {
            category: catId,
            subcategory: subcatId,
            comment: comments[`${catId}:${subcatId}`] ?? null,
          }
        })
    )
    try {
      await saveResidentSkills(user.id, skills)
      setInitial(JSON.stringify({ selected, comments }))
      setSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <p className="text-sm text-gray-400">Chargement...</p>

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">Sélectionne ce que tu peux proposer.</p>

      <div className="divide-y divide-gray-100">
        {CATEGORIES.map(cat => {
          const catSelected = selected[cat.id] ?? []
          const autreSelected = catSelected.includes(AUTRE_SUBCAT_ID)
          const regularSubcats = cat.subcategories.filter(s => s.id !== AUTRE_SUBCAT_ID)

          return (
            <div key={cat.id} className="py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {cat.emoji} {cat.label}
              </p>

              {/* Sous-catégories normales */}
              <div className="flex flex-wrap gap-2 mb-3">
                {regularSubcats.map(sub => {
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

              {/* Champs détail pour les sous-catégories normales sélectionnées */}
              {regularSubcats
                .filter(sub => catSelected.includes(sub.id as SubcatId))
                .map(sub => (
                  <div key={sub.id} className="mb-2">
                    <label className="text-xs text-gray-400 block mb-1">{sub.label}</label>
                    <input
                      type="text"
                      value={comments[`${cat.id}:${sub.id}`] ?? ''}
                      onChange={e => setComment(`${cat.id}:${sub.id}`, e.target.value)}
                      placeholder="Ajouter un détail... (facultatif)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                ))}

              {/* Autre — séparé */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <button
                  onClick={() => toggle(cat.id, AUTRE_SUBCAT_ID)}
                  className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                    autreSelected
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Autre
                </button>
                {autreSelected && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={comments[`${cat.id}:${AUTRE_SUBCAT_ID}`] ?? ''}
                      onChange={e => setComment(`${cat.id}:${AUTRE_SUBCAT_ID}`, e.target.value)}
                      placeholder="Ce que tu proposes (ex : Fabrication de savons) *"
                      className="w-full border border-emerald-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-emerald-400 bg-emerald-50"
                    />
                    <input
                      type="text"
                      value={comments[`${cat.id}:${AUTRE_SUBCAT_ID}:desc`] ?? ''}
                      onChange={e => setComment(`${cat.id}:${AUTRE_SUBCAT_ID}:desc`, e.target.value)}
                      placeholder="Description supplémentaire (facultatif)"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || !isDirty}
        className="w-full mt-4 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm disabled:opacity-40 hover:bg-emerald-600 transition-all"
      >
        {isSaving ? 'Enregistrement...' : saved && !isDirty ? '✓ Enregistré' : 'Enregistrer'}
      </button>
    </div>
  )
}
