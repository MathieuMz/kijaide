'use client'

import { useState, useTransition } from 'react'
import { CATEGORIES } from '@/constants/categories'
import type { Service } from '@/lib/types'
import CategoryGrid from './CategoryGrid'
import ServiceList from './ServiceList'

interface Props {
  initialServices: Service[]
  categories: typeof CATEGORIES
}

export default function ServiceExplorer({ initialServices, categories }: Props) {
  const [services, setServices] = useState(initialServices)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [mode, setMode] = useState<'offer' | 'request'>('offer')
  const [isPending, startTransition] = useTransition()

  async function handleCategoryChange(categoryLabel: string | null) {
    setActiveCategory(categoryLabel)
    setActiveSubcategory(null)
    fetchServices(categoryLabel, null)
  }

  async function handleSubcategoryChange(sub: string | null) {
    setActiveSubcategory(sub)
    fetchServices(activeCategory, sub)
  }

  function fetchServices(category: string | null, subcategory: string | null) {
    startTransition(async () => {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (subcategory) params.set('subcategory', subcategory)
      params.set('type', mode)

      const res = await fetch(`/api/services?${params}`)
      const data = await res.json()
      setServices(data)
    })
  }

  const selectedCategory = categories.find(c => c.label === activeCategory)

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden mb-5">
        {(['offer', 'request'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); fetchServices(activeCategory, activeSubcategory) }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {m === 'offer' ? 'Je cherche de l\'aide' : 'Je propose mon aide'}
          </button>
        ))}
      </div>

      {/* Category grid */}
      <CategoryGrid
        categories={categories}
        activeCategory={activeCategory}
        onSelect={handleCategoryChange}
      />

      {/* Subcategories */}
      {selectedCategory && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          <button
            onClick={() => handleSubcategoryChange(null)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm border transition-colors ${
              !activeSubcategory
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            Tous
          </button>
          {selectedCategory.subcategories.map(sub => (
            <button
              key={sub}
              onClick={() => handleSubcategoryChange(sub)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm border transition-colors ${
                activeSubcategory === sub
                  ? 'bg-emerÞald-600 border-emerald-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <ServiceList services={services} isPending={isPending} />
    </div>
  )
}