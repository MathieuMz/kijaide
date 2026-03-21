'use client'

import { useEffect, useState } from 'react'
import { fetchServices } from '@/lib/api'
import { CATEGORIES } from '@/constants/categories'
import ServiceExplorer from '@/components/services/ServiceExplorer'
import type { Service } from '@/lib/types'

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices({ type: 'offer' })
      .then(setServices)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Kijaide</h1>
          <p className="text-sm text-gray-500">Pays de Landivisiau</p>
        </div>

       <a href="/services/new"
        className="ml-auto text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
        + Proposer
      </a>
    </header><div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ServiceExplorer
            initialServices={services}
            categories={CATEGORIES} />
        )}
      </div>
    </main>
  )
}