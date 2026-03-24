'use client'

import { CATEGORIES } from '@/constants/categories'

interface Props {
  categories: typeof CATEGORIES
  activeCategory: string | null
  onSelect: (label: string | null) => void
}

export default function CategoryGrid({ categories, activeCategory, onSelect }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-5">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
              isActive
                ? 'border-emerald-500 border-2'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            style={{ backgroundColor: isActive ? cat.bg : undefined }}
          >
            <span className="text-2xl mb-1">{cat.emoji}</span>
            <span
              className={`text-[11px] text-center leading-tight ${
                isActive ? 'font-medium text-emerald-800' : 'text-gray-700'
              }`}
            >
              {cat.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}