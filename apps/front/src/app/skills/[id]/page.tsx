'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchSkillById, fetchResident, createExchange } from '@/lib/api'
import { CATEGORIES } from '@/constants/categories'
import { ADJECTIVES } from '@/constants/adjectives'
import { useCurrentUser } from '@/context/CurrentUser'
import { useOrgConfig } from '@/context/OrgConfig'
import type { Skill, Resident } from '@/lib/types'
import { CreditPolicy } from '@/lib/types'
import ResidentCard from '@/components/ResidentCard'

type ContactStep = 'idle' | 'message' | 'sent'

export default function SkillPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useCurrentUser()
  const org = useOrgConfig()

  const [skill, setSkill] = useState<Skill | null>(null)
  const [residentFull, setResidentFull] = useState<Resident | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [contactStep, setContactStep] = useState<ContactStep>('idle')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchSkillById(id)
      .then(s => {
        setSkill(s)
        return fetchResident(s.resident_id)
      })
      .then(setResidentFull)
      .catch(() => router.push('/'))
      .finally(() => setIsLoading(false))
  }, [id, router])

  async function handleSend() {
    if (!skill || !message.trim()) return
    setIsSending(true)
    try {
      await createExchange({
        skill_id: skill.id,
        requester_id: user!.id,
        provider_id: skill.resident_id,
        message: message.trim(),
      })
      setContactStep('sent')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="h-8 w-32 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </main>
    )
  }

  if (!skill) return null

  const cat = CATEGORIES.find(c => c.id === skill.category)
  const subcatLabel = cat?.subcategories.find(s => s.id === skill.subcategory)?.label ?? skill.subcategory
  const resident = skill.resident

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Retour
        </button>
        <h1 className="text-base font-medium text-gray-900 truncate">{subcatLabel}</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Carte principale */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-4"
            style={{ backgroundColor: cat?.bg ?? '#f5f5f5' }}
          >
            <span>{cat?.emoji}</span>
            <span>{cat?.label}</span>
            {subcatLabel && <span className="text-gray-500">· {subcatLabel}</span>}
          </div>

          {skill.comment ? (
            <p className="text-sm text-gray-700 leading-relaxed">{skill.comment}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Aucun détail renseigné.</p>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-gray-500 border-t border-gray-100 pt-4 mt-4">
            {resident?.city && (
              <span className="flex items-center gap-1.5">
                <span>📍</span>{resident.city}
              </span>
            )}
            {resident?.availability && (
              <span className="flex items-center gap-1.5">
                <span>📅</span>{resident.availability}
              </span>
            )}
          </div>
        </div>

        {/* Profil */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Proposé par
          </p>
          {resident && (
            <ResidentCard resident={resident} locationLabel={resident.city} />
          )}
          {resident?.bio && (
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">{resident.bio}</p>
          )}
          {residentFull?.appreciations && residentFull.appreciations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {residentFull.appreciations.map(adjId => {
                const adj = ADJECTIVES.find(a => a.id === adjId)
                return adj ? (
                  <span key={adjId} className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                    {adj.label}
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* Contact */}
        {skill.resident_id !== user?.id ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {contactStep === 'idle' && (() => {
              const noCredit = (user?.credit_balance ?? 0) <= 0
              const policy = org?.credit_policy ?? CreditPolicy.Open
              const isBlocked = noCredit && policy === CreditPolicy.Block
              const isWarned = noCredit && policy === CreditPolicy.Warn
              return (
                <>
                  {isWarned && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                      Tu n&apos;as plus de crédit disponible. Pense à rendre service en retour.
                    </p>
                  )}
                  {isBlocked ? (
                    <div className="text-center py-2">
                      <p className="text-sm font-medium text-gray-900 mb-1">Crédit insuffisant</p>
                      <p className="text-xs text-gray-500">Tu dois rendre un service avant de pouvoir en demander un nouveau.</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setContactStep('message')}
                      className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Je suis intéressé(e)
                    </button>
                  )}
                </>
              )
            })()}

            {contactStep === 'message' && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">
                  Envoie un message à {resident?.first_name}
                </p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Bonjour ${resident?.first_name}, je suis intéressé(e)...`}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-400 resize-none mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setContactStep('idle')}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium disabled:opacity-40 hover:bg-emerald-700 transition-colors"
                  >
                    {isSending ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            )}

            {contactStep === 'sent' && (
              <div className="text-center py-2">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-sm font-medium text-gray-900 mb-1">Message envoyé !</p>
                <p className="text-xs text-gray-500">
                  {resident?.first_name} recevra ta demande et pourra te répondre.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 text-sm text-emerald-600 hover:underline"
                >
                  Retour à l&apos;accueil
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-center">
            C&apos;est ta compétence.
          </div>
        )}
      </div>
    </main>
  )
}
