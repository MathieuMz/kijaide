export type ServiceStatus = 'active' | 'paused' | 'archived'

export enum ExchangeStatus {
  Pending   = 'pending',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export enum CreditPolicy {
  Open  = 'open',
  Warn  = 'warn',
  Block = 'block',
}

export type Adjective = import('@/constants/adjectives').AdjectiveId

export interface Organization {
  id: string
  name: string
  slug: string
  primary_color: string | null
  credit_policy: CreditPolicy
  starting_credits: number
}

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
  services_given?: number
  services_received?: number
  appreciations?: Adjective[]
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

export interface Interest {
  id: string
  resident_id: string
  category: string
  subcategory: string | null
  created_at: string
}

export interface Appreciation {
  id: string
  exchange_id: string
  giver_id: string
  receiver_id: string
  adjective: Adjective
  created_at: string
}
