import type { Skill } from '@/lib/types'
import ServiceCard from './ServiceCard'

interface Props {
  services: Skill[]
  isPending: boolean
  userLat?: number | null
  userLng?: number | null
}

export default function ServiceList({ services, isPending, userLat, userLng }: Props) {
  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!services.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        Aucune proposition de service dans cette catégorie pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-3">
        {services.length} proposition{services.length > 1 ? 's' : ''} de service
      </p>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} userLat={userLat} userLng={userLng} />
      ))}
    </div>
  )
}