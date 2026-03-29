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

  // POST /api/exchanges/:id/appreciation
  app.post('/exchanges/:id/appreciation', async (req, reply) => {
    const { id } = req.params as { id: string }
    const { adjectives } = req.body as { adjectives: string[] }

    if (!adjectives?.length) return reply.send({ ok: true })

    const { data: exchange } = await supabase
      .from('exchange')
      .select('status, requester_id, provider_id')
      .eq('id', id)
      .single()

    if (!exchange) return reply.status(404).send({ error: 'Exchange not found' })
    if (exchange.status !== 'completed') {
      return reply.status(400).send({ error: 'Exchange must be completed to leave an appreciation' })
    }

    // Le requester apprécie le provider
    const giver_id = exchange.requester_id
    const receiver_id = exchange.provider_id

    const rows = adjectives.map(adjective => ({
      exchange_id: id,
      giver_id,
      receiver_id,
      adjective,
    }))

    const { error } = await supabase
      .from('appreciation')
      .upsert(rows, { onConflict: 'exchange_id,giver_id,adjective' })

    if (error) return reply.status(500).send({ error: error.message })
    return reply.send({ ok: true })
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
        await supabase.rpc('transfer_credits', {
          from_id: exchange.requester_id,
          to_id: exchange.provider_id,
          amount: 1,
        })

        await supabase
          .from('exchange')
          .update({
            status: 'completed',
            credits_transferred: 1,
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
