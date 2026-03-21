import { NextRequest, NextResponse } from 'next/server'
import { getServices } from '@/lib/supabase/services'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const services = await getServices({
    category: searchParams.get('category') ?? undefined,
    subcategory: searchParams.get('subcategory') ?? undefined,
    type: (searchParams.get('type') as 'offer' | 'request') ?? 'offer',
  })

  return NextResponse.json(services)
}