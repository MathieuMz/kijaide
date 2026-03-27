import { ExchangeStatus } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function fetchOrganization(id: string) {
  const res = await fetch(`${API_URL}/organizations/${id}`)
  if (!res.ok) throw new Error('Organization not found')
  return res.json()
}

export async function fetchSkills(params?: {
  category?: string
  subcategory?: string
}) {
  const query = new URLSearchParams()
  if (params?.category)    query.set('category', params.category)
  if (params?.subcategory) query.set('subcategory', params.subcategory)

  const res = await fetch(`${API_URL}/skills?${query}`)
  if (!res.ok) throw new Error('Failed to fetch skills')
  return res.json()
}

export async function fetchSkillById(id: string) {
  const res = await fetch(`${API_URL}/skills/${id}`)
  if (!res.ok) throw new Error('Skill not found')
  return res.json()
}

export async function createResident(body: {
  first_name: string
  organization_id: string
  lat?: number | null
  lng?: number | null
  address?: string | null
  city?: string | null
  availability?: string | null
}) {
  const res = await fetch(`${API_URL}/residents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to create resident')
  return res.json()
}

export async function fetchResidents() {
  const res = await fetch(`${API_URL}/residents`)
  if (!res.ok) throw new Error('Failed to fetch residents')
  return res.json()
}

export async function updateResident(id: string, body: {
  first_name?: string
  lat?: number | null
  lng?: number | null
  address?: string | null
  availability?: string | null
}) {
  const res = await fetch(`${API_URL}/residents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to update resident')
  return res.json()
}

export async function fetchResident(id: string) {
  const res = await fetch(`${API_URL}/residents/${id}`)
  if (!res.ok) throw new Error('Resident not found')
  return res.json()
}

export async function fetchResidentSkills(id: string) {
  const res = await fetch(`${API_URL}/residents/${id}/skills`)
  if (!res.ok) throw new Error('Failed to fetch skills')
  return res.json()
}

export async function saveResidentSkills(
  residentId: string,
  skills: Array<{ category: string; subcategory?: string | null; comment?: string | null }>
) {
  const res = await fetch(`${API_URL}/residents/${residentId}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(skills),
  })
  if (!res.ok) throw new Error('Failed to save skills')
  return res.json()
}

export async function createExchange(payload: {
  skill_id: string
  requester_id: string
  provider_id: string
  message?: string
}) {
  const res = await fetch(`${API_URL}/exchanges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create exchange')
  return res.json()
}

export async function fetchExchanges(residentId: string) {
  const res = await fetch(`${API_URL}/residents/${residentId}/exchanges`)
  if (!res.ok) throw new Error('Failed to fetch exchanges')
  return res.json()
}

export async function updateExchangeStatus(
  id: string,
  status: ExchangeStatus
) {
  const res = await fetch(`${API_URL}/exchanges/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update exchange')
  return res.json()
}
