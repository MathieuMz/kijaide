import type { Service } from '@/lib/types'
import ServiceCard from './ServiceCard'

interface Props {
  services: Service[]
  isPending: boolean
}

export default function ServiceList({ services, isPending }: Props) {
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
        Aucun service dans cette catégorie pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-3">
        {services.length} service{services.length > 1 ? 's' : ''}
      </p>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  )
}