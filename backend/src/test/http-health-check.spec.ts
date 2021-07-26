import { startFastify } from '../http-server/server'
import { fastifyPortOf } from '../repo/config-repo'
import { FastifyInstance } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

/* tslint:disable:no-console no-empty */
describe('Healthcheck route', () => {
  let server: FastifyInstance<Server, IncomingMessage, ServerResponse>

  beforeAll(async () => {
    server = startFastify(fastifyPortOf(8888))
  })

  afterAll(async () => {
    await pipe(
      TE.tryCatch(
        async () => await server.close(),
        (reason) => new Error(`Failed to close a Fastify server, reason: ${reason}`)
      ),
      TE.match(
        (e) => console.error(e),
        (_) => console.log('Closing Fastify server is done!')
      )
    )()
  })

  it(`hello should say 'hello'`, async () => {
    const response = await server.inject({ method: 'GET', url: '/v1/health' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(JSON.stringify({ status: 'green' }))
  })
})
