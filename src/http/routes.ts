import { FastifyInstance } from 'fastify'
import { profile } from './controllers/profile'
import { register } from './controllers/register'
import { authenticate } from './controllers/authenticate'
import { verifyJWT } from './middlewares/verify-jwt'

export async function appRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  /** Authenticated **/
  app.get('/me', { onRequest: [verifyJWT] }, profile)
}
