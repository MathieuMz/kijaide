import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'

export default async function residentsRoutes(app: FastifyInstance) {

  // GET /api/residents/:id
  app.get('/residents/:id', async (req, reply) => {
    const { id } = req.params as { id: string }

    const { data, error } = await supabase
      .from('resident')
      .select('*, location (id, name, city)')
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
}