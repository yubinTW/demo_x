import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import { tryCatch, match } from 'fp-ts/Either'
import { zero } from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import * as dbHandler from './db'
import * as fs from 'fs'
import { pipe } from 'fp-ts/function'
import { ioEither } from 'fp-ts'
import { NatsUserRepoImpl } from '../repo/natsUser-repo'

describe('NatsUserRepo CRU', () => {
  let server: FastifyInstance<Server, IncomingMessage, ServerResponse>
  beforeAll(async () => {
    await dbHandler.connect()
    server = startFastify(fastifyPortOf(8888))
  })

  afterEach(async () => {
    await dbHandler.clearDatabase()
  })

  afterAll(async () => {
    match(
      (e) => console.log(e),
      (_) => console.log('Closing Fastify server is done!')
    )(
      tryCatch(
        () => {
          dbHandler.closeDatabase()
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          server.close((): void => {})
        },
        (reason) => new Error(`Failed to close a Fastify server, reason: ${reason}`)
      )
    )
  })

  // TODO
  it('should pass', () => {
    expect(1).toBe(1)
  })
  

  
})
