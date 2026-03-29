import Link from 'next/link'
import { CATEGORIES, AUTRE_SUBCAT_ID } from '@/constants/categories'
import { haversineKm, formatDistance } from '@/lib/geo'
import type { Skill } from '@/lib/types'
import ResidentCard from '@/components/ResidentCard'

interface Props {
  service: Skill
  userLat?: number | null
  userLng?: number | null
  highlighted?: boolean
}

export default function ServiceCard({ service: skill, userLat, userLng, highlighted = false }: Props) {
  const cat = CATEGORIES.find((c) => c.id === skill.category)
  const isAutre = skill.subcategory === AUTRE_SUBCAT_ID
  const [autreTitle, autreDesc] = isAutre ? (skill.comment ?? '').split('\n') : []
  const subcatLabel = isAutre
    ? (autreTitle || 'Autre')
    : (cat?.subcategories.find((s) => s.id === skill.subcategory)?.label ?? skill.subcategory)
  const displayComment = isAutre ? (autreDesc ?? null) : skill.comment
  const resident = skill.resident

  const skillLat = resident?.lat ?? null
  const skillLng = resident?.lng ?? null

  const distance =
    userLat != null && userLng != null && skillLat != null && skillLng != null
      ? haversineKm(userLat, userLng, skillLat, skillLng)
      : null

  const locationLabel = distance != null ? formatDistance(distance) : (resident?.city ?? null)

  return (
    <Link
      href={`/skills/${skill.id}`}
      className={`block bg-white rounded-xl border p-4 transition-colors ${
        highlighted
          ? 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-500'
          : 'border-gray-200 hover:border-emerald-400'
      }`}
    >
      {highlighted && (
        <p className="text-xs text-emerald-600 font-medium mb-2">✦ Correspond à tes intérêts</p>
      )}
      {/* Compétence */}
      <div className="flex gap-2.5 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ backgroundColor: cat?.bg ?? '#f5f5f5' }}
        >
          {cat?.emoji ?? '🔧'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{subcatLabel}</p>
          {displayComment && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
              {displayComment}
            </p>
          )}
        </div>
      </div>

      {/* Résident */}
      <div className="pt-3 border-t border-gray-100">
        {resident && <ResidentCard resident={resident} locationLabel={locationLabel} />}
      </div>
    </Link>
  )
}
