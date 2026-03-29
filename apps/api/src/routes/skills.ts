import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'
import { APPRECIATION_DISPLAY_THRESHOLD } from '../lib/constants'

async function enrichWithStats(skills: any[]) {
  const residentIds = [...new Set(skills.map((s) => s.resident?.id).filter(Boolean))] as string[]
  if (!residentIds.length) return skills

  const { data: exchanges } = await supabase
    .from('exchange')
    .select('provider_id, requester_id')
    .eq('status', 'completed')
    .or(`provider_id.in.(${residentIds.join(',')}),requester_id.in.(${residentIds.join(',')})`)

  const given: Record<string, number> = {}
  const received: Record<string, number> = {}
  for (const ex of exchanges ?? []) {
    given[ex.provider_id] = (given[ex.provider_id] ?? 0) + 1
    received[ex.requester_id] = (received[ex.requester_id] ?? 0) + 1
  }

  return skills.map((s) => ({
    ...s,
    resident: s.resident ? {
      ...s.resident,
      services_given: given[s.resident.id] ?? 0,
      services_received: received[s.resident.id] ?? 0,
    } : s.resident,
  }))
}

export default async function skillsRoutes(app: FastifyInstance) {

  // GET /api/skills
  app.get('/skills', async (req, reply) => {
    const { category, subcategory, match_resident_id } = req.query as {
      category?: string
      subcategory?: string
      match_resident_id?: string
    }

    let query = supabase
      .from('skill')
      .select(`
        *,
        resident (
          id,
          first_name,
          credit_balance,
          availability,
          lat,
          lng,
          city
        )
      `)
      .order('id')

    if (category)    query = query.eq('category', category)
    if (subcategory) query = query.eq('subcategory', subcategory)

    if (match_resident_id) {
      const { data: interests } = await supabase
        .from('interest')
        .select('category, subcategory')
        .eq('resident_id', match_resident_id)

      if (!interests?.length) return reply.send([])

      // Pour chaque intérêt : si subcategory null → toute la catégorie, sinon catégorie + sous-catégorie
      const orParts = interests.map(i =>
        i.subcategory
          ? `and(category.eq.${i.category},subcategory.eq.${i.subcategory})`
          : `category.eq.${i.category}`
      )
      query = query.or(orParts.join(','))
    }

    const { data, error } = await query
    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(await enrichWithStats(data))
  })

  // GET /api/skills/:id
  app.get('/skills/:id', async (req, reply) => {
    const { id } = req.params as { id: string }

    const { data, error } = await supabase
      .from('skill')
      .select(`
        *,
        resident (
          id,
          first_name,
          credit_balance,
          bio,
          availability,
          lat,
          lng,
          city
        )
      `)
      .eq('id', id)
      .single()

    if (error) return reply.status(404).send({ error: 'Skill not found' })
    const [enriched] = await enrichWithStats([data])

    if (enriched.resident?.id) {
      const { data: appreciationsRaw } = await supabase
        .from('appreciation')
        .select('adjective')
        .eq('receiver_id', enriched.resident.id)

      const counts: Record<string, number> = {}
      for (const a of appreciationsRaw ?? []) {
        counts[a.adjective] = (counts[a.adjective] ?? 0) + 1
      }
      enriched.resident.appreciations = Object.entries(counts)
        .filter(([, count]) => count >= APPRECIATION_DISPLAY_THRESHOLD)
        .map(([adjective]) => adjective)
    }

    return reply.send(enriched)
  })
}
