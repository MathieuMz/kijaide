import { NextRequest, NextResponse } from 'next/server'
import { getServices, createService } from '@/lib/supabase/services'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const services = await getServices({
    category: searchParams.get('category') ?? undefined,
    subcategory: searchParams.get('subcategory') ?? undefined,
    type: (searchParams.get('type') as 'offer' | 'request') ?? 'offer',
  })
  return NextResponse.json(services)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const service = await createService(body)
  if (!service) {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
  return NextResponse.json(service, { status: 201 })
}