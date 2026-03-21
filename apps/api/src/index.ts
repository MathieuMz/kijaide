import Fastify from 'fastify'
import cors from '@fastify/cors'
import 'dotenv/config'

import servicesRoutes from './routes/services'
import residentsRoutes from './routes/residents'
import exchangesRoutes from './routes/exchanges'

const app = Fastify({ logger: true })

async function main() {
  await app.register(cors, {
    origin: 'http://localhost:3000',
  })

  await app.register(servicesRoutes, { prefix: '/api' })
  await app.register(residentsRoutes, { prefix: '/api' })
  await app.register(exchangesRoutes, { prefix: '/api' })

  await app.listen({ port: Number(process.env.PORT ?? 3001) })
}

main();