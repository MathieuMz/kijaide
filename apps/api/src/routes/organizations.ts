import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'

export default async function organizationsRoutes(app: FastifyInstance) {

  // GET /api/organizations/:id
  app.get('/organizations/:id', async (req, reply) => {
    const { id } = req.params as { id: string }

    const { data, error } = await supabase
      .from('organization')
      .select('id, name, slug, primary_color, credit_policy, starting_credits')
      .eq('id', id)
      .single()

    if (error) return reply.status(404).send({ error: 'Organization not found' })
    return reply.send(data)
  })
}
