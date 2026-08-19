'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/constants/categories'
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [showFiltersMobile, setShowFiltersMobile] = useState(false)

  const filtered = activeCategory
    ? initialSkills.filter(s =>
        s.category === activeCategory &&
        (activeSubcategory === null || s.subcategory === activeSubcategory)
      )
    : initialSkills

  function handleCategoryChange(id: string | null) {
    setActiveCategory(id)
    setActiveSubcategory(null)
  }

  function handleSubcategoryChange(sub: string | null) {
    setActiveSubcategory(sub)
  }

  function handleToggleMobileFilters() {
    if (showFiltersMobile && activeCategory) {
      setActiveCategory(null)
      setActiveSubcategory(null)
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
                ? 'bg-brand-600 border-brand-600 text-white'
                : 'border-brand-800 bg-brand-950 text-brand-300 font-medium hover:border-brand-500 hover:text-brand-100'
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
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'border-brand-800 bg-brand-950 text-brand-300 font-medium hover:border-brand-500 hover:text-brand-100'
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
        <h2 className="text-base font-bold text-slate-800">
          {activeCategory
            ? `Services proposés · ${selectedCategory?.label}`
            : 'Services proposés'}
        </h2>
        {/* Bouton filtrer visible uniquement sur mobile */}
        <button
          onClick={handleToggleMobileFilters}
          className={`md:hidden flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            showFiltersMobile
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-brand-800 bg-brand-950 text-brand-300 font-semibold hover:border-brand-500 hover:text-brand-100'
          }`}
        >
          <span>Filtrer</span>
          {activeCategory && !showFiltersMobile && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
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

      <ServiceList services={filtered} isPending={false} userLat={userLat} userLng={userLng} />
    </div>
  )
}
