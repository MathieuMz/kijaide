'use client'

import { useState, useCallback } from 'react'
import { CATEGORIES } from '@/constants/categories'
import { fetchSkills } from '@/lib/api'
import type { Skill } from '@/lib/types'
import CategoryGrid from './CategoryGrid'
import ServiceList from './ServiceList'

interface Props {
  initialSkills: Skill[]
  categories: typeof CATEGORIES
  userLat?: number | null
  userLng?: number | null
}

export default function ServiceExplorer({ initialSkills, categories, userLat, userLng }: Props) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // Sur mobile, les filtres sont masqués derrière un bouton
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  const load = useCallback(async (
    category: string | null,
    subcategory: string | null,
  ) => {
    setIsLoading(true)
    try {
      const data = await fetchSkills({
        category: category ?? undefined,
        subcategory: subcategory ?? undefined,
      })
      setSkills(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  function handleCategoryChange(id: string | null) {
    setActiveCategory(id)
    setActiveSubcategory(null)
    load(id, null)
  }

  function handleSubcategoryChange(sub: string | null) {
    setActiveSubcategory(sub)
    load(activeCategory, sub)
  }

  function handleToggleMobileFilters() {
    if (showFiltersMobile && activeCategory) {
      setActiveCategory(null)
      setActiveSubcategory(null)
      load(null, null)
    }
    setShowFiltersMobile(v => !v)
  }

  const selectedCategory = categories.find(c => c.id === activeCategory)

  const filterPanel = (
    <>
      <CategoryGrid
        categories={categories}
        activeCategory={activeCategory}
        onSelect={handleCategoryChange}
      />
      {selectedCategory && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
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
              key={sub.id}
              onClick={() => handleSubcategoryChange(sub.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm border transition-colors ${
                activeSubcategory === sub.id
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}
    </>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">
          {activeCategory
            ? `Services proposés · ${selectedCategory?.label}`
            : 'Services proposés'}
        </h2>
        {/* Bouton filtrer visible uniquement sur mobile */}
        <button
          onClick={handleToggleMobileFilters}
          className={`md:hidden flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            showFiltersMobile
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          <span>Filtrer</span>
          {activeCategory && !showFiltersMobile && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Desktop : filtres toujours visibles */}
      <div className="hidden md:block">
        {filterPanel}
      </div>

      {/* Mobile : filtres derrière bouton */}
      {showFiltersMobile && (
        <div className="md:hidden">
          {filterPanel}
        </div>
      )}

      <ServiceList services={skills} isPending={isLoading} userLat={userLat} userLng={userLng} />
    </div>
  )
}
