import { createClient } from './server'
import type { Service } from '../types'

const DEMO_SLUG = 'cc-landivisiau'

export async function getServices(params?: {
  category?: string
  subcategory?: string
  type?: 'offer' | 'request'
}): Promise<Service[]> {
  const supabase = await createClient()

  let query = supabase
    .from('service')
    .select(`
      *,
      resident (
        id,
        first_name,
        credit_balance,
        location (
          id,
          name,
          city
        )
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (params?.category) {
    query = query.eq('category', params.category)
  }
  if (params?.subcategory) {
    query = query.eq('subcategory', params.subcategory)
  }
  if (params?.type) {
    query = query.eq('type', params.type)
  }

  const { data, error } = await query

  if (error) {
    console.error('getServices error:', error)
    return []
  }

  return data as Service[]
}

export async function getServiceById(id: string): Promise<Service | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service')
    .select(`
      *,
      resident (
        id,
        first_name,
        credit_balance,
        bio,
        location (
          id,
          name,
          city
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('getServiceById error:', error)
    return null
  }

  return data as Service
}

export async function getExchangeCountByService(serviceId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('exchange')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', serviceId)
    .eq('status', 'completed')

  if (error) return 0
  return count ?? 0
}