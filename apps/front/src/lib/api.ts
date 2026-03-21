const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function fetchServices(params?: {
  category?: string
  subcategory?: string
  type?: 'offer' | 'request'
}) {
  const query = new URLSearchParams()
  if (params?.category)    query.set('category', params.category)
  if (params?.subcategory) query.set('subcategory', params.subcategory)
  if (params?.type)        query.set('type', params.type)

  const res = await fetch(`${API_URL}/services?${query}`)
  if (!res.ok) throw new Error('Failed to fetch services')
  return res.json()
}

export async function fetchServiceById(id: string) {
  const res = await fetch(`${API_URL}/services/${id}`)
  if (!res.ok) throw new Error('Service not found')
  return res.json()
}

export async function fetchResident(id: string) {
  console.log(API_URL)
  const res = await fetch(`${API_URL}/residents/${id}`)
  if (!res.ok) throw new Error('Resident not found')
  return res.json()
}

export async function fetchResidentSkills(id: string) {
  const res = await fetch(`${API_URL}/residents/${id}/skills`)
  if (!res.ok) throw new Error('Failed to fetch skills')
  return res.json()
}

export async function createService(payload: object) {
  const res = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create service')
  return res.json()
}

export async function createExchange(payload: object) {
  const res = await fetch(`${API_URL}/exchanges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create exchange')
  return res.json()
}