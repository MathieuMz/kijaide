import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'
import { APPRECIATION_DISPLAY_THRESHOLD } from '../lib/constants'

export default async function residentsRoutes(app: FastifyInstance) {

  // GET /api/residents
  app.get('/residents', async (_req, reply) => {
    const { data, error } = await supabase
      .from('resident')
      .select('id, first_name, credit_balance, availability, lat, lng, address, city, skill (id)')
      .order('first_name')

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // POST /api/residents
  app.post('/residents', async (req, reply) => {
    const body = req.body as {
      first_name: string
      organization_id: string
      email?: string | null
      email_digest?: boolean
      lat?: number | null
      lng?: number | null
      address?: string | null
      city?: string | null
      availability?: string | null
    }

    const { data: org } = await supabase
      .from('organization')
      .select('starting_credits')
      .eq('id', body.organization_id)
      .single()

    const startingCredits = org?.starting_credits ?? 1

    const { data, error } = await supabase
      .from('resident')
      .insert({ ...body, credit_balance: startingCredits })
      .select('*')
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // GET /api/residents/:id
  app.get('/residents/:id', async (req, reply) => {
    const { id } = req.params as { id: string }

    const [{ data, error }, { count: given }, { count: received }, { data: appreciationsRaw }] = await Promise.all([
      supabase.from('resident').select('*').eq('id', id).single(),
      supabase.from('exchange').select('*', { count: 'exact', head: true })
        .eq('provider_id', id).eq('status', 'completed'),
      supabase.from('exchange').select('*', { count: 'exact', head: true })
        .eq('requester_id', id).eq('status', 'completed'),
      supabase.from('appreciation').select('adjective').eq('receiver_id', id),
    ])

    if (error) return reply.status(404).send({ error: 'Resident not found' })

    // Adjectifs affichés uniquement si 3+ personnes ont donné le même
    const counts: Record<string, number> = {}
    for (const a of appreciationsRaw ?? []) {
      counts[a.adjective] = (counts[a.adjective] ?? 0) + 1
    }
    console.log(counts)
    const appreciations = Object.entries(counts)
      .filter(([, count]) => count >= APPRECIATION_DISPLAY_THRESHOLD)
      .map(([adjective]) => adjective)

    return reply.send({
      ...data,
      services_given: given ?? 0,
      services_received: received ?? 0,
      appreciations,
    })
  })

  // GET /api/residents/:id/skills
  app.get('/residents/:id/skills', async (req, reply) => {
    const { id } = req.params as { id: string }

    const { data, error } = await supabase
      .from('skill')
      .select('*')
      .eq('resident_id', id)

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // PATCH /api/residents/:id
  app.patch('/residents/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as {
      first_name?: string
      lat?: number | null
      lng?: number | null
      address?: string | null
      availability?: string | null
    }

    const { data, error } = await supabase
      .from('resident')
      .update(body)
      .eq('id', id)
      .select('id, first_name, lat, lng, address, availability')
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // POST /api/residents/:id/skills — bulk replace
  app.post('/residents/:id/skills', async (req, reply) => {
    const { id } = req.params as { id: string }
    const skills = req.body as Array<{ category: string; subcategory?: string | null; comment?: string | null }>

    await supabase.from('skill').delete().eq('resident_id', id)

    if (!skills.length) return reply.send([])

    const { data, error } = await supabase
      .from('skill')
      .insert(skills.map(s => ({ ...s, resident_id: id })))
      .select()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // GET /api/residents/:id/interests
  app.get('/residents/:id/interests', async (req, reply) => {
    const { id } = req.params as { id: string }

    const { data, error } = await supabase
      .from('interest')
      .select('*')
      .eq('resident_id', id)

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // POST /api/residents/:id/interests — bulk replace
  app.post('/residents/:id/interests', async (req, reply) => {
    const { id } = req.params as { id: string }
    const interests = req.body as Array<{ category: string; subcategory?: string | null }>

    await supabase.from('interest').delete().eq('resident_id', id)

    if (!interests.length) return reply.send([])

    const { data, error } = await supabase
      .from('interest')
      .insert(interests.map(i => ({ ...i, resident_id: id })))
      .select()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })
}
