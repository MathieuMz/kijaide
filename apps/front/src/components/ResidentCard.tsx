import type { Resident } from '@/lib/types'

interface Props {
  resident: Resident
  locationLabel?: string | null
}

export default function ResidentCard({ resident, locationLabel }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 flex-shrink-0">
        {resident.first_name?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 leading-none">{resident.first_name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {locationLabel && <span className="text-xs text-slate-500">{locationLabel}</span>}
          {locationLabel && resident.availability && <span className="text-slate-200">·</span>}
          {resident.availability && (
            <span className="text-xs text-slate-500 truncate">📅 {resident.availability}</span>
          )}
        </div>
      </div>
      {resident.services_given != null && (
        <div className="flex-shrink-0 text-right">
          <p className="text-xs font-semibold text-brand-600">
            {resident.services_given} donné{resident.services_given > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-slate-500">
            {resident.services_received} reçu{(resident.services_received ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
