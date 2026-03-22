import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'

export default async function servicesRoutes(app: FastifyInstance) {

  // GET /api/services
  app.get('/services', async (req, reply) => {
    const { category, subcategory, type = 'offer' } = req.query as {
      category?: string
      subcategory?: string
      type?: string
    }

    let query = supabase
      .from('service')
      .select(`
        *,
        resident (
          id,
          first_name,
          credit_balance,
          location ( id, name, city ),
          availability
        )
      `)
      .eq('status', 'active')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (category)    query = query.eq('category', category)
    if (subcategory) query = query.eq('subcategory', subcategory)

    const { data, error } = await query

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // GET /api/services/:id
  app.get('/services/:id', async (req, reply) => {
    const { id } = req.params as { id: string }

    const { data, error } = await supabase
      .from('service')
      .select(`
        *,
        resident (
          id,
          first_name,
          credit_balance,
          bio,
          location ( id, name, city ),
          availability
        )
      `)
      .eq('id', id)
      .single()

    if (error) return reply.status(404).send({ error: 'Service not found' })
    return reply.send(data)
  })

  // POST /api/services
  app.post('/services', async (req, reply) => {
    const body = req.body as {
      resident_id: string
      title: string
      description?: string
      category: string
      subcategory?: string
      type: 'offer' | 'request'
    }

    const { data, error } = await supabase
      .from('service')
      .insert({ ...body, status: 'active' })
      .select('id')
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // PATCH /api/services/:id/status
  app.patch('/services/:id/status', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { status } = req.body as { status: 'active' | 'paused' | 'archived' }

    const { data, error } = await supabase
      .from('service')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })
}