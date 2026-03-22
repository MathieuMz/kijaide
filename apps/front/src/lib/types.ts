export type ServiceType = 'offer' | 'request'
export type ServiceStatus = 'active' | 'paused' | 'archived'
export type ExchangeStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Organization {
  id: string
  name: string
  slug: string
  primary_color: string
}

export interface Location {
  id: string
  name: string
  city: string
  zip_code: string
  organization_id: string
  lat: number
  lng: number
}

export interface Resident {
  id: string
  first_name: string
  location_id: string
  bio: string | null
  credit_balance: number
  availability: string | null
  created_at: string
  location?: Location
}

export interface Service {
  id: string
  resident_id: string
  title: string
  description: string | null
  category: string
  subcategory: string | null
  type: ServiceType
  status: ServiceStatus
  lat: number | null
  lng: number | null
  created_at: string
  resident?: Resident
}

export interface Exchange {
  id: string
  service_id: string
  requester_id: string
  provider_id: string
  status: ExchangeStatus
  duration_minutes: number | null
  credits_transferred: number | null
  message: string | null
  completed_at: string | null
  created_at: string
}