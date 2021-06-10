import { startFastify } from '../http-server/server'
import { fastifyPortOf } from '../repo/config-repo'
import { FastifyInstance } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { tryCatch, match } from 'fp-ts/Either'

/* tslint:disable:no-console no-empty */
describe('Healthcheck route', () => {
  let server: FastifyInstance<Server, IncomingMessage, ServerResponse>

  beforeAll(() => {
    server = startFastify(fastifyPortOf(8888))
  })

  afterAll(() => {
    match(
      (e) => console.log(e),
      (_) => console.log('Closing Fastify server is done!')
    )(
      tryCatch(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => server.close((): void => {}),
        (reason) => new Error(`Failed to close a Fastify server, reason: ${reason}`)
      )
    )
  })

  it(`hello should say 'hello'`, async () => {
    const response = await server.inject({ method: 'GET', url: '/v1/health' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(JSON.stringify({ status: 'green' }))
  })
})
