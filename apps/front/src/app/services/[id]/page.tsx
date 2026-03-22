'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchServiceById, createExchange } from '@/lib/api'
import { CATEGORIES } from '@/constants/categories'
import { DEMO_RESIDENT_ID } from '@/constants/demo'
import type { Service } from '@/lib/types'

type ContactStep = 'idle' | 'message' | 'sent'

export default function ServicePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [service, setService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [contactStep, setContactStep] = useState<ContactStep>('idle')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    fetchServiceById(id)
      .then(setService)
      .catch(() => router.push('/'))
      .finally(() => setIsLoading(false))
  }, [id, router])

  async function handleSend() {
    if (!service || !message.trim()) return
    setIsSending(true)
    try {
      await createExchange({
        service_id: service.id,
        requester_id: DEMO_RESIDENT_ID,
        provider_id: service.resident_id,
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
          <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </main>
    )
  }

  if (!service) return null

  const cat = CATEGORIES.find(c => c.label === service.category)
  const resident = service.resident as any
  const location = resident?.location

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Retour
        </button>
        <h1 className="text-base font-medium text-gray-900 truncate">
          {service.title}
        </h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Carte principale */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {/* Catégorie */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-4"
            style={{ backgroundColor: cat?.bg ?? '#f5f5f5' }}
          >
            <span>{cat?.emoji}</span>
            <span>{service.category}</span>
            {service.subcategory && (
              <span className="text-gray-400">· {service.subcategory}</span>
            )}
          </div>

          {/* Titre */}
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {service.title}
          </h2>

          {/* Description */}
          {service.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {service.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 border-t border-gray-100 pt-4">
            {location?.name && (
              <span className="flex items-center gap-1.5">
                <span>📍</span>
                {location.name}
              </span>
            )}
            {resident.availability && (
              <span className="flex items-center gap-1.5">
                <span>📅</span>
                {resident.availability}
              </span>
            )}
          </div>
        </div>

        {/* Profil du résident — révélation progressive niveau 1 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            Proposé par
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-medium text-emerald-700 flex-shrink-0">
              {resident?.first_name?.[0] ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {resident?.first_name}
              </p>
              <p className="text-xs text-gray-500">
                {location?.name}
                {resident?.credit_balance != null && (
                  <span className="ml-2 text-emerald-600">
                    · {resident.credit_balance} crédits
                  </span>
                )}
              </p>
            </div>
            <div className="text-xs bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-1 font-medium">
              Vérifié
            </div>
          </div>
          {resident?.bio && (
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              {resident.bio}
            </p>
          )}
        </div>

        {/* Zone de contact */}
        {service.resident_id !== DEMO_RESIDENT_ID && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            {contactStep === 'idle' && (
              <button
                onClick={() => setContactStep('message')}
                className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Je suis intéressé(e)
              </button>
            )}

            {contactStep === 'message' && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">
                  Envoie un message à {resident?.first_name}
                </p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Bonjour ${resident?.first_name}, je suis intéressé(e) par votre service...`}
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
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Message envoyé !
                </p>
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
        )}

        {/* Si c'est son propre service */}
        {service.resident_id === DEMO_RESIDENT_ID && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-center">
            C&apos;est ton service — tu ne peux pas te contacter toi-même.
          </div>
        )}

      </div>
    </main>
  )
}