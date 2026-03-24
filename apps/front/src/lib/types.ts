export type ServiceStatus = 'active' | 'paused' | 'archived'
export type ExchangeStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Resident {
  id: string
  first_name: string
  bio: string | null
  credit_balance: number
  availability: string | null
  lat: number | null
  lng: number | null
  address: string | null
  city: string | null
  created_at: string
}

export interface Skill {
  id: string
  resident_id: string
  category: string
  subcategory: string | null
  comment: string | null
  resident?: Resident
}

export interface Exchange {
  id: string
  skill_id: string
  requester_id: string
  provider_id: string
  status: ExchangeStatus
  duration_minutes: number | null
  credits_transferred: number | null
  message: string | null
  completed_at: string | null
  created_at: string
  skill?: Pick<Skill, 'id' | 'category' | 'subcategory' | 'comment'>
}
