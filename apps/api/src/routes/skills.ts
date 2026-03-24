import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'

export default async function skillsRoutes(app: FastifyInstance) {

  // GET /api/skills
  app.get('/skills', async (req, reply) => {
    const { category, subcategory } = req.query as {
      category?: string
      subcategory?: string
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
          city,
          lat,
          lng
        )
      `)
      .order('id')

    if (category)    query = query.eq('category', category)
    if (subcategory) query = query.eq('subcategory', subcategory)

    const { data, error } = await query
    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
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
          city,
          lat,
          lng
        )
      `)
      .eq('id', id)
      .single()

    if (error) return reply.status(404).send({ error: 'Skill not found' })
    return reply.send(data)
  })
}
