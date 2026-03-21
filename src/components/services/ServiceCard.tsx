import Link from 'next/link'
import { CATEGORIES } from '@/constants/categories'
import type { Service } from '@/lib/types'

interface Props {
  service: Service
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`
}

function distanceLabel(service: Service): string {
  // Pour la demo on simule — en prod ce sera calculé
  // depuis les coords du résident connecté
  const distances = [
    'Dans ta commune',
    'À moins de 2 km',
    'À moins de 5 km',
    'À moins de 15 km',
  ]
  return distances[Math.floor(Math.random() * 2)] // demo : commune ou 2km
}

export default function ServiceCard({ service }: Props) {
  const cat = CATEGORIES.find((c) => c.label === service.category)
  const resident = service.resident
  const location = resident?.location

  return (
    <Link
      href={`/services/${service.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-400 transition-colors"
    >
      {/* Top row */}
      <div className="flex gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: cat?.bg ?? '#f5f5f5' }}
        >
          {cat?.emoji ?? '🔧'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-snug">
            {service.title}
          </p>
          {service.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
              {service.description}
            </p>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 pt-2.5">
        {/* Distance badge */}
        <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-1">
          {location?.name ?? 'Commune inconnue'}
        </span>

        {/* Duration */}
        {service.duration_minutes && (
          <span className="text-xs text-gray-400">
            ⏱ {formatDuration(service.duration_minutes)}
          </span>
        )}

        {/* Availability */}
        {service.availability && (
          <span className="text-xs text-gray-400 truncate max-w-[140px]">
            📅 {service.availability}
          </span>
        )}

        {/* Exchange count — placeholder pour la demo */}
        <span className="ml-auto text-xs text-emerald-600 font-medium">
          {Math.floor(Math.random() * 4)} échange{Math.random() > 0.5 ? 's' : ''}
        </span>
      </div>
    </Link>
  )
}