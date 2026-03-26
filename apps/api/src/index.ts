import Fastify from 'fastify'
import cors from '@fastify/cors'
import 'dotenv/config'

import residentsRoutes from './routes/residents'
import exchangesRoutes from './routes/exchanges'
import skillsRoutes from './routes/skills'

const app = Fastify({ logger: true })

async function main() {
  await app.register(cors, {
    origin: ["http://localhost:3000", "https://kijaide.onrender.com"],
  })

  await app.register(residentsRoutes, { prefix: '/api' })
  await app.register(exchangesRoutes, { prefix: '/api' })
  await app.register(skillsRoutes, { prefix: '/api' })

  await app.listen({ port: Number(process.env.PORT ?? 3001), host: '0.0.0.0' })
}

main();
