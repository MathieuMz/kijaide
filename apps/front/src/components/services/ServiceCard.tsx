import Link from 'next/link'
import { CATEGORIES } from '@/constants/categories'
import { haversineKm, formatDistance } from '@/lib/geo'
import type { Skill } from '@/lib/types'

interface Props {
  service: Skill
  userLat?: number | null
  userLng?: number | null
}

export default function ServiceCard({ service: skill, userLat, userLng }: Props) {
  const cat = CATEGORIES.find((c) => c.id === skill.category)
  const subcatLabel = cat?.subcategories.find((s) => s.id === skill.subcategory)?.label ?? skill.subcategory
  const resident = skill.resident

  const skillLat = resident?.lat ?? null
  const skillLng = resident?.lng ?? null

  const distance =
    userLat != null && userLng != null && skillLat != null && skillLng != null
      ? haversineKm(userLat, userLng, skillLat, skillLng)
      : null

  return (
    <Link
      href={`/skills/${skill.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-400 transition-colors"
    >
      <div className="flex gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: cat?.bg ?? '#f5f5f5' }}
        >
          {cat?.emoji ?? '🔧'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{subcatLabel}</p>
          {skill.comment && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              {skill.comment}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 pt-2.5">
        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-1">
          {distance != null ? formatDistance(distance) : (resident?.city ?? 'Commune inconnue')}
        </span>
        {resident?.availability && (
          <span className="text-xs text-gray-400 truncate max-w-[180px]">
            📅 {resident.availability}
          </span>
        )}
        <span className="ml-auto text-xs text-gray-500">{resident?.first_name}</span>
      </div>
    </Link>
  )
}
