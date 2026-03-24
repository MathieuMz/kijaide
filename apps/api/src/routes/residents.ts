import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'

export default async function residentsRoutes(app: FastifyInstance) {

  // GET /api/residents
  app.get('/residents', async (_req, reply) => {
    const { data, error } = await supabase
      .from('resident')
      .select('id, first_name, credit_balance, availability, lat, lng, city, skill (id)')
      .order('first_name')

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // POST /api/residents
  app.post('/residents', async (req, reply) => {
    const body = req.body as {
      first_name: string
      organization_id: string
      lat?: number | null
      lng?: number | null
      address?: string | null
      city?: string | null
      availability?: string | null
    }

    const { data, error } = await supabase
      .from('resident')
      .insert({ ...body, credit_balance: 0 })
      .select('*')
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // GET /api/residents/:id
  app.get('/residents/:id', async (req, reply) => {
    const { id } = req.params as { id: string }

    const { data, error } = await supabase
      .from('resident')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return reply.status(404).send({ error: 'Resident not found' })
    return reply.send(data)
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
    const skills = req.body as Array<{ category: string; subcategory?: string | null }>

    await supabase.from('skill').delete().eq('resident_id', id)

    if (!skills.length) return reply.send([])

    const { data, error } = await supabase
      .from('skill')
      .insert(skills.map(s => ({ ...s, resident_id: id })))
      .select()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })
}