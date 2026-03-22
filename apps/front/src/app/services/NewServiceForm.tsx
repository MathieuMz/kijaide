'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORIES } from '@/constants/categories'
import type { Resident } from '@/lib/types'
import { createService } from '@/lib/api'

interface Skill {
  id: string
  category: string
  subcategory: string
  comment: string | null
}

interface Props {
  resident: Resident
  skills: Skill[]
}

const SUGGESTIONS: Record<string, string> = {
  'Jardinage':           'Je peux venir tailler vos haies, tondre, planter. J\'ai mon propre matériel.',
  'Taille / haies':      'Je m\'occupe de la taille de vos haies et arbustes. Résultat soigné.',
  'Bricolage':           'Je peux aider pour des petites réparations, monter des meubles, fixer des étagères.',
  'Garde enfants':       'Je garde vos enfants chez vous ou chez moi. Ambiance bienveillante.',
  'Smartphone / tablette': 'Je vous aide à configurer votre téléphone ou tablette. Mails, photos, applis.',
  'Covoiturage':         'Je fais régulièrement ce trajet, je peux prendre des passagers.',
  'Cuisine à domicile':  'Je cuisine chez vous ou vous apprenez à cuisiner avec moi.',
  'Transport médical':   'Je peux vous emmener chez le médecin ou à la pharmacie.',
}

type Step = 'skill' | 'details' | 'preview'

export default function NewServiceForm({ resident, skills }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('skill')
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const suggestion = selectedSkill ? SUGGESTIONS[selectedSkill.subcategory] : null

  async function handleSubmit() {
    if (!selectedSkill) return
    setIsSubmitting(true)

    try {
      const data = await createService({
        resident_id: resident.id,
        title: title || selectedSkill.subcategory,
        description,
        category: selectedSkill.category,
        subcategory: selectedSkill.subcategory,
        type: 'offer',
      });
      setIsSubmitting(false)

      if (data.id) {
        router.push(`/services/${data.id}`)
      }
    } catch(e) {
        setIsSubmitting(false)
        console.error(e)
    }

  }

  // ── Step 1 : choix de la compétence ──────────────────────
  if (step === 'skill') {
    return (
      <div>
        <Progress step={1} />
        <h2 className="text-lg font-medium text-gray-900 mb-1">
          Quel service tu veux proposer ?
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          On part de ce que tu sais déjà faire.
        </p>

        {skills.length > 0 && (
          <>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
              Tes compétences
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {skills.map((skill) => {
                const cat = CATEGORIES.find(c => c.label === skill.category)
                return (
                  <button
                    key={skill.id}
                    onClick={() => {
                      setSelectedSkill(skill)
                      setDescription(SUGGESTIONS[skill.subcategory] ?? '')
                      setStep('details')
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-emerald-400 transition-colors"
                  >
                    <span>{cat?.emoji}</span>
                    {skill.subcategory}
                  </button>
                )
              })}
            </div>
          </>
        )}

        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Ou propose autre chose
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat =>
            cat.subcategories.map(sub => {
              const alreadyHas = skills.some(s => s.subcategory === sub)
              if (alreadyHas) return null
              return (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSkill({ id: '', category: cat.label, subcategory: sub, comment: null })
                    setDescription(SUGGESTIONS[sub] ?? '')
                    setStep('details')
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-gray-300 bg-white text-sm text-gray-500 hover:border-emerald-400 hover:text-gray-700 transition-colors"
                >
                  {sub}
                </button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // ── Step 2 : détails ─────────────────────────────────────
  if (step === 'details') {
    const cat = CATEGORIES.find(c => c.label === selectedSkill?.category)

    return (
      <div>
        <Progress step={2} />
        <h2 className="text-lg font-medium text-gray-900 mb-1">
          Décris ton service
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Quelques mots suffisent. Sois naturel(le).
        </p>

        {/* Titre */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 block mb-1.5">
            Titre <span className="font-normal text-gray-400">(facultatif)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={`Ex : ${selectedSkill?.subcategory}`}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 block mb-1.5">
            Description
          </label>
          {suggestion && !description && (
            <button
              onClick={() => setDescription(suggestion)}
              className="w-full flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 mb-2 hover:border-emerald-400 transition-colors text-left"
            >
              <span className="text-xs text-emerald-600 font-medium whitespace-nowrap">
                Suggestion
              </span>
              <span className="text-xs text-gray-500 italic flex-1 line-clamp-1">
                {suggestion}
              </span>
              <span className="text-xs text-emerald-600 whitespace-nowrap">
                Utiliser →
              </span>
            </button>
          )}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Décris ce que tu proposes..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('skill')}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Retour
          </button>
          <button
            onClick={() => setStep('preview')}
            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-emerald-700 transition-colors"
          >
            Voir l&apos;aperçu
          </button>
        </div>
      </div>
    )
  }

  // ── Step 3 : aperçu ───────────────────────────────────────
  const cat = CATEGORIES.find(c => c.label === selectedSkill?.category)

  return (
    <div>
      <Progress step={3} />
      <h2 className="text-lg font-medium text-gray-900 mb-1">
        Voilà ce que verront tes voisins
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        Tu pourras modifier ou archiver ce service à tout moment.
      </p>

      {/* Preview card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: cat?.bg ?? '#f5f5f5' }}
          >
            {cat?.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {title || selectedSkill?.subcategory}
            </p>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 pt-2.5">
          <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-1">
            {(resident as any).location?.name ?? 'Ta commune'}
          </span>
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 mt-3 pt-3">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">
            {resident.first_name[0]}
          </div>
          <span className="text-xs text-gray-500">
            {resident.first_name} · <span className="text-emerald-600">Vérifié</span>
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('details')}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          Modifier
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-emerald-700 transition-colors"
        >
          {isSubmitting ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </div>
  )
}

function Progress({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {[1, 2, 3].map(s => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full transition-colors ${
            s <= step ? 'bg-emerald-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}