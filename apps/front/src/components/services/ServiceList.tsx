import type { Skill } from '@/lib/types'
import ServiceCard from './ServiceCard'
import { haversineKm } from '@/lib/geo'

interface Props {
  services: Skill[]
  isPending: boolean
  userLat?: number | null
  userLng?: number | null
  highlighted?: boolean
}

export default function ServiceList({ services, isPending, userLat, userLng, highlighted = false }: Props) {
  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-slate-200 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!services.length) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        Aucune proposition de service dans cette catégorie pour le moment.
      </div>
    )
  }

  const sorted = userLat != null && userLng != null
    ? [...services].sort((a, b) => {
        const distA = a.resident?.lat != null && a.resident?.lng != null
          ? haversineKm(userLat, userLng, a.resident.lat, a.resident.lng)
          : Infinity
        const distB = b.resident?.lat != null && b.resident?.lng != null
          ? haversineKm(userLat, userLng, b.resident.lat, b.resident.lng)
          : Infinity
        return distA - distB
      })
    : services

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sorted.map((service) => (
        <ServiceCard key={service.id} service={service} userLat={userLat} userLng={userLng} highlighted={highlighted} />
      ))}
    </div>
  )
}