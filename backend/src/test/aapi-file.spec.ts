/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import * as dbHandler from './db'
import * as TE from 'fp-ts/TaskEither'
import { IAapi, AapiBody } from '../types/aapi'
import { pipe } from 'fp-ts/function'
import fs from 'fs'
import FormData from 'form-data'
import { format } from 'prettier'

/**
 *
 * @group unit
 */
describe('Aapi test', () => {
  let server: FastifyInstance<Server, IncomingMessage, ServerResponse>

  beforeAll(async () => {
    await pipe(
      TE.tryCatch(
        () => dbHandler.connect(),
        (e) => new Error(`Connect db error: ${e}`)
      ),
      TE.match(
        (e) => console.error(`${e}`),
        () => {}
      )
    )()
    server = startFastify(fastifyPortOf(8888))
  })

  afterEach(async () => {
    await pipe(
      TE.tryCatch(
        () => dbHandler.clearDatabase(),
        (e) => new Error(`Clear db error: ${e}`)
      ),
      TE.match(
        (e) => console.error(`e`),
        () => {}
      )
    )()
  })

  afterAll(async () => {
    await pipe(
      TE.tryCatch(
        () => Promise.all([dbHandler.closeDatabase(), server.close()]),
        (reason) => new Error(`Failed to close a Fastify server, reason: ${reason}`)
      ),
      TE.match(
        (e) => console.error(e),
        (_) => console.log('Closing Fastify server is done!')
      )
    )()
  })

  it('upload file', async () => {
    const form = new FormData()
    const mockYaml = path.join(__dirname, './resources/test.yaml')
    form.append('aapi-yaml-file', fs.createReadStream(mockYaml, 'utf-8'))

    const response = await server.inject({
      method: 'POST',
      url: '/v1/aapi-file',
      payload: form,
      headers: form.getHeaders()
    })
    expect(response.statusCode).toBe(201)
    const res: { aapi: AapiBody } = JSON.parse(response.body)
    expect(res.aapi.aapiOwner).toBe('Tiger team')
    expect(res.aapi.description).toBe('The Event spec of Siview Lot Hold event')
    expect(res.aapi.product).toBe('SiMM')
    expect(res.aapi.productSuite).toBe('GigaCIM')
    //console.log(response)
  })
})
