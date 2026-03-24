import { FastifyInstance } from 'fastify'
import { supabase } from '../lib/supabase'

export default async function exchangesRoutes(app: FastifyInstance) {

  // POST /api/exchanges
  app.post('/exchanges', async (req, reply) => {
    const body = req.body as {
      skill_id: string
      requester_id: string
      provider_id: string
      message?: string
    }

    const { data, error } = await supabase
      .from('exchange')
      .insert({ ...body, status: 'pending' })
      .select('id')
      .single()

    if (error) return reply.status(500).send({ error: error.message })
    return reply.status(201).send(data)
  })

  // GET /api/residents/:id/exchanges
  app.get('/residents/:id/exchanges', async (req, reply) => {
    const { id } = req.params as { id: string }

    const { data, error } = await supabase
      .from('exchange')
      .select(`
        *,
        skill (
          id,
          category,
          subcategory,
          comment
        ),
        requester:resident!exchange_requester_id_fkey (
          id,
          first_name,
          city
        ),
        provider:resident!exchange_provider_id_fkey (
          id,
          first_name,
          city
        )
      `)
      .or(`requester_id.eq.${id},provider_id.eq.${id}`)
      .order('created_at', { ascending: false })

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send(data)
  })

  // POST /api/exchanges/:id/status
  app.post('/exchanges/:id/status', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { status } = req.body as {
      status: 'confirmed' | 'completed' | 'cancelled'
    }

    if (status === 'completed') {
      const { data: exchange } = await supabase
        .from('exchange')
        .select('*')
        .eq('id', id)
        .single()

      if (exchange) {
        const credits = exchange.duration_minutes ?? 60

        await supabase.rpc('transfer_credits', {
          from_id: exchange.requester_id,
          to_id: exchange.provider_id,
          amount: credits,
        })

        await supabase
          .from('exchange')
          .update({
            status: 'completed',
            credits_transferred: credits,
            completed_at: new Date().toISOString(),
          })
          .eq('id', id)
      }
    } else {
      await supabase
        .from('exchange')
        .update({ status })
        .eq('id', id)
    }

    return reply.send({ ok: true })
  })
}
