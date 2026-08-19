'use client'

import { CATEGORIES } from '@/constants/categories'

interface Props {
  categories: typeof CATEGORIES
  activeCategory: string | null
  onSelect: (label: string | null) => void
}

export default function CategoryGrid({ categories, activeCategory, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full border text-sm transition-all ${
              isActive
                ? 'border-brand-500 font-semibold text-brand-800'
                : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
            }`}
            style={{ backgroundColor: isActive ? cat.bg : undefined }}
          >
            <span className="text-base">{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        )
      })}
    </div>
  )
}
