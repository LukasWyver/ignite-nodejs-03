import fastify from 'fastify'
import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'
import { env } from './env'

export const app = fastify()

// Setup
neonConfig.webSocketConstructor = ws
const connectionString = `${env.DATABASE_URL}`

// Init prisma client
const pool = new Pool({ connectionString })
const adapter = new PrismaNeon(pool)
const prisma = new PrismaClient({ adapter })

// Use Prisma Client as normal
prisma.user.create({
  data: {
    name: 'Lucas',
    email: 'lucas@web2midia.com',
  },
})
