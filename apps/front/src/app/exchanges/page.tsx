'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchExchanges, updateExchangeStatus, createAppreciation } from '@/lib/api'
import { CATEGORIES, AUTRE_SUBCAT_ID } from '@/constants/categories'
import { useCurrentUser } from '@/context/CurrentUser'
import { ExchangeStatus } from '@/lib/types'
import { ADJECTIVES } from '@/constants/adjectives'
import type { AdjectiveId } from '@/constants/adjectives'

interface Exchange {
  id: string
  status: ExchangeStatus
  message: string | null
  credits_transferred: number | null
  completed_at: string | null
  created_at: string
  skill: {
    id: string
    category: string
    subcategory: string | null
    comment: string | null
  }
  duration_minutes: number | null
  requester: { id: string; first_name: string; city: string | null }
  provider: { id: string; first_name: string; city: string | null }
}

const STATUS_LABEL: Record<ExchangeStatus, string> = {
  [ExchangeStatus.Pending]:   'En attente',
  [ExchangeStatus.Confirmed]: 'Confirmé',
  [ExchangeStatus.Completed]: 'Réalisé',
  [ExchangeStatus.Cancelled]: 'Annulé',
}

const STATUS_COLOR: Record<ExchangeStatus, string> = {
  [ExchangeStatus.Pending]:   'bg-amber-50 text-amber-700',
  [ExchangeStatus.Confirmed]: 'bg-blue-50 text-blue-700',
  [ExchangeStatus.Completed]: 'bg-emerald-50 text-emerald-700',
  [ExchangeStatus.Cancelled]: 'bg-gray-100 text-gray-500',
}


function formatDuration(minutes: number | null): string {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
}

function skillLabel(skill: Exchange['skill']): string {
  if (!skill) return ''
  if (skill.subcategory === AUTRE_SUBCAT_ID) {
    return skill.comment?.split('\n')[0] ?? 'Autre'
  }
  const cat = CATEGORIES.find(c => c.id === skill.category)
  return cat?.subcategories.find(s => s.id === skill.subcategory)?.label ?? skill.subcategory ?? ''
}

enum Tab {
  Received = 'received',
  Sent     = 'sent',
}

const TAB_LABEL: Record<Tab, string> = {
  [Tab.Received]: 'Reçus',
  [Tab.Sent]:     'Envoyés',
}

export default function ExchangesPage() {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Received)
  const [updating, setUpdating] = useState<string | null>(null)

  // Formulaire combiné "Marquer réalisé + appréciation"
  const [completionOpen, setCompletionOpen] = useState<Set<string>>(new Set())
  const [selectedAdjectives, setSelectedAdjectives] = useState<Record<string, AdjectiveId[]>>({})
  const [appreciationDone, setAppreciationDone] = useState<Set<string>>(new Set())

  // Formulaire appréciation seul (pour exchanges déjà completed au chargement)
  const [appreciationOpen, setAppreciationOpen] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return
    fetchExchanges(user.id)
      .then(setExchanges)
      .finally(() => setIsLoading(false))
  }, [user])

  async function handleStatus(exchangeId: string, status: ExchangeStatus) {
    setUpdating(exchangeId)
    try {
      await updateExchangeStatus(exchangeId, status)
      setExchanges(prev =>
        prev.map(e => e.id === exchangeId ? { ...e, status } : e)
      )
    } finally {
      setUpdating(null)
    }
  }

  async function handleCompleteWithAppreciation(exchange: Exchange) {
    const adjectives = selectedAdjectives[exchange.id] ?? []
    setUpdating(exchange.id)
    try {
      await updateExchangeStatus(exchange.id, ExchangeStatus.Completed)
      if (adjectives.length > 0) {
        await createAppreciation(exchange.id, adjectives)
        setAppreciationDone(prev => new Set([...prev, exchange.id]))
      }
      setExchanges(prev =>
        prev.map(e => e.id === exchange.id ? { ...e, status: ExchangeStatus.Completed, credits_transferred: 1 } : e)
      )
      setCompletionOpen(prev => { const s = new Set(prev); s.delete(exchange.id); return s })
    } finally {
      setUpdating(null)
    }
  }

  async function handleAppreciation(exchange: Exchange) {
    const adjectives = selectedAdjectives[exchange.id] ?? []
    if (!adjectives.length || !user) return
    setUpdating(exchange.id)
    try {
      await createAppreciation(exchange.id, adjectives)
      setAppreciationDone(prev => new Set([...prev, exchange.id]))
      setAppreciationOpen(prev => { const s = new Set(prev); s.delete(exchange.id); return s })
    } finally {
      setUpdating(null)
    }
  }

  function toggleAdjective(exchangeId: string, adj: AdjectiveId) {
    setSelectedAdjectives(prev => {
      const current = prev[exchangeId] ?? []
      return {
        ...prev,
        [exchangeId]: current.includes(adj)
          ? current.filter(a => a !== adj)
          : [...current, adj],
      }
    })
  }

  const received = exchanges.filter(e => e.provider.id === user?.id)
  const sent     = exchanges.filter(e => e.requester.id === user?.id)
  const displayed = activeTab === Tab.Received ? received : sent

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Retour
        </button>
        <h1 className="text-base font-medium text-gray-900">Mes échanges</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-5">
          {([Tab.Received, Tab.Sent]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {TAB_LABEL[tab]}
              {tab === Tab.Received && received.filter(e => e.status === ExchangeStatus.Pending).length > 0 && (
                <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {activeTab === Tab.Received
              ? 'Personne ne t\'a encore contacté.'
              : 'Tu n\'as pas encore envoyé de demande.'}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(exchange => {
              const cat = CATEGORIES.find(c => c.id === exchange.skill?.category)
              const isRequester = exchange.requester.id === user?.id
              const other = isRequester ? exchange.provider : exchange.requester
              const isUpdating = updating === exchange.id
              const isCompletionOpen = completionOpen.has(exchange.id)
              const isAppreciationOpen = appreciationOpen.has(exchange.id)
              const adjectives = selectedAdjectives[exchange.id] ?? []

              // Appréciation rétroactive : échange déjà completed au chargement, requester, pas encore fait cette session
              const canAppreciateRetro = isRequester
                && exchange.status === ExchangeStatus.Completed
                && !appreciationDone.has(exchange.id)

              return (
                <div key={exchange.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  {/* Top */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: cat?.bg ?? '#f5f5f5' }}
                    >
                      {cat?.emoji ?? '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {skillLabel(exchange.skill)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isRequester ? 'À' : 'De'}{' '}
                        <span className="font-medium text-gray-700">{other.first_name}</span>
                        {' · '}{other.city}
                        {exchange.duration_minutes && (
                          <span className="ml-1 text-gray-400">· ⏱ {formatDuration(exchange.duration_minutes)}</span>
                        )}
                      </p>
                    </div>
                    <span className={`text-xs rounded-full px-2.5 py-1 font-medium flex-shrink-0 ${STATUS_COLOR[exchange.status]}`}>
                      {STATUS_LABEL[exchange.status]}
                    </span>
                  </div>

                  {/* Message */}
                  {exchange.message && (
                    <p className="text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2 mb-3">
                      "{exchange.message}"
                    </p>
                  )}

                  {/* Crédits transférés */}
                  {exchange.status === ExchangeStatus.Completed && exchange.credits_transferred && (
                    <p className="text-xs text-emerald-600 font-medium mb-3">
                      ✓ 1 service transféré
                    </p>
                  )}

                  {/* Appréciation envoyée cette session */}
                  {appreciationDone.has(exchange.id) && (
                    <p className="text-xs text-emerald-600 font-medium pt-2 border-t border-gray-100">
                      ✓ Appréciation envoyée à {other.first_name}
                    </p>
                  )}

                  {/* ── Actions ── */}

                  {/* Pending — provider : accepter / décliner */}
                  {exchange.status === ExchangeStatus.Pending && !isRequester && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatus(exchange.id, ExchangeStatus.Cancelled)}
                        disabled={isUpdating}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Décliner
                      </button>
                      <button
                        onClick={() => handleStatus(exchange.id, ExchangeStatus.Confirmed)}
                        disabled={isUpdating}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-40"
                      >
                        {isUpdating ? '...' : 'Accepter'}
                      </button>
                    </div>
                  )}

                  {/* Pending — requester : annuler */}
                  {exchange.status === ExchangeStatus.Pending && isRequester && (
                    <button
                      onClick={() => handleStatus(exchange.id, ExchangeStatus.Cancelled)}
                      disabled={isUpdating}
                      className="w-full py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Annuler la demande
                    </button>
                  )}

                  {/* Confirmed — provider : annuler uniquement */}
                  {exchange.status === ExchangeStatus.Confirmed && !isRequester && (
                    <button
                      onClick={() => handleStatus(exchange.id, ExchangeStatus.Cancelled)}
                      disabled={isUpdating}
                      className="w-full py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Annuler
                    </button>
                  )}

                  {/* Confirmed — requester : formulaire combiné réalisé + appréciation */}
                  {exchange.status === ExchangeStatus.Confirmed && isRequester && !isCompletionOpen && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatus(exchange.id, ExchangeStatus.Cancelled)}
                        disabled={isUpdating}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => setCompletionOpen(prev => new Set([...prev, exchange.id]))}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                      >
                        Marquer réalisé
                      </button>
                    </div>
                  )}

                  {exchange.status === ExchangeStatus.Confirmed && isRequester && isCompletionOpen && (
                    <div className="border-t border-gray-100 pt-3 space-y-3">
                      <p className="text-xs font-medium text-gray-700">
                        Comment était {other.first_name} ? <span className="text-gray-400 font-normal">(facultatif)</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ADJECTIVES.map(adj => {
                          const active = adjectives.includes(adj.id)
                          return (
                            <button
                              key={adj.id}
                              onClick={() => toggleAdjective(exchange.id, adj.id)}
                              className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                                active
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              {adj.label}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCompletionOpen(prev => { const s = new Set(prev); s.delete(exchange.id); return s })}
                          className="flex-1 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50"
                        >
                          Retour
                        </button>
                        <button
                          onClick={() => handleCompleteWithAppreciation(exchange)}
                          disabled={isUpdating}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-40"
                        >
                          {isUpdating ? '...' : 'Confirmer la réalisation'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Completed — appréciation rétroactive (échange déjà réalisé au chargement) */}
                  {canAppreciateRetro && !isAppreciationOpen && !appreciationDone.has(exchange.id) && (
                    <button
                      onClick={() => setAppreciationOpen(prev => new Set([...prev, exchange.id]))}
                      className="w-full py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Laisser une appréciation à {other.first_name}
                    </button>
                  )}

                  {canAppreciateRetro && isAppreciationOpen && (
                    <div className="border-t border-gray-100 pt-3 space-y-3">
                      <p className="text-xs font-medium text-gray-600">
                        Comment était {other.first_name} ?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ADJECTIVES.map(adj => {
                          const active = adjectives.includes(adj.id)
                          return (
                            <button
                              key={adj.id}
                              onClick={() => toggleAdjective(exchange.id, adj.id)}
                              className={`px-3 py-1.5 rounded-full border text-xs transition-all ${
                                active
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              {adj.label}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAppreciationOpen(prev => { const s = new Set(prev); s.delete(exchange.id); return s })}
                          className="flex-1 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50"
                        >
                          Passer
                        </button>
                        <button
                          onClick={() => handleAppreciation(exchange)}
                          disabled={adjectives.length === 0 || isUpdating}
                          className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-40"
                        >
                          {isUpdating ? '...' : 'Envoyer'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
