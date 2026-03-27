'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchExchanges, updateExchangeStatus } from '@/lib/api'
import { CATEGORIES } from '@/constants/categories'
import { useCurrentUser } from '@/context/CurrentUser'
import { ExchangeStatus } from '@/lib/types'

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

        {/* Tabs */}
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

        {/* Liste */}
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
              const subcatLabel = cat?.subcategories.find(s => s.id === exchange.skill?.subcategory)?.label ?? exchange.skill?.subcategory
              const isReceived = exchange.provider.id === user?.id
              const other = isReceived ? exchange.requester : exchange.provider
              const isUpdating = updating === exchange.id

              return (
                <div
                  key={exchange.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
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
                        {subcatLabel}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isReceived ? 'De' : 'À'}{' '}
                        <span className="font-medium text-gray-700">
                          {other.first_name}
                        </span>
                        {' · '}{other.city}
                        {exchange.duration_minutes && (
                          <span className="ml-1 text-gray-400">
                            · ⏱ {formatDuration(exchange.duration_minutes)}
                          </span>
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

                  {/* Crédits si réalisé */}
                  {exchange.status === ExchangeStatus.Completed && exchange.credits_transferred && (
                    <p className="text-xs text-emerald-600 font-medium mb-3">
                      ✓ {exchange.credits_transferred} crédits transférés
                    </p>
                  )}

                  {/* Actions */}
                  {exchange.status === ExchangeStatus.Pending && isReceived && (
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

                  {exchange.status === ExchangeStatus.Confirmed && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatus(exchange.id, ExchangeStatus.Cancelled)}
                        disabled={isUpdating}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleStatus(exchange.id, ExchangeStatus.Completed)}
                        disabled={isUpdating}
                        className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-40"
                      >
                        {isUpdating ? '...' : 'Marquer réalisé'}
                      </button>
                    </div>
                  )}

                  {exchange.status === ExchangeStatus.Pending && !isReceived && (
                    <button
                      onClick={() => handleStatus(exchange.id, ExchangeStatus.Cancelled)}
                      disabled={isUpdating}
                      className="w-full py-2 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Annuler la demande
                    </button>
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