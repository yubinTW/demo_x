/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as dbHandler from './db'
import { tryCatch, match } from 'fp-ts/Either'
import { IAapi } from '../types/aapi'

describe('Aapi test', () => {
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

  it('should successfully get a empty list of aapis', async () => {
    const response = await server.inject({ method: 'GET', url: '/v1/aapis' })

    // https://docs.nats.io/nats-server/configuration/securing_nats/accounts
    // TODO - need to discuss subscriberId (NATS: users of an account), talk to Nelson
    // for now use UUID for subscriberId
    // TODO - need to make sure if the submitter ID is Windows account
    // there will be another external service for decoding the auth token
    // data Status = On | Off
    // TODO - should a `aapi` be removed?
    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual(JSON.stringify({ aapis: [] }))
  })

  it('should successfully post a aapi to mongodb and can be found', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/v1/aapi',
      payload: {
        title: 'aapi01',
        productSuite: 'ps01',
        product: 'product01',
        aapiOwner: 'ywchuo',
        subject: 'ps01.product01.user01.event01',
        doc: 'this is test1',
        status: 'on'
      }
    })

    expect(response.statusCode).toBe(201)

    const res: { aapi: IAapi } = JSON.parse(response.body)
    expect(res.aapi.title).toBe('aapi01')
    expect(res.aapi.productSuite).toBe('ps01')
    expect(res.aapi.product).toBe('product01')
    expect(res.aapi.aapiOwner).toBe('ywchuo')
    expect(res.aapi.subject).toBe('ps01.product01.user01.event01')
    expect(res.aapi.doc).toBe('this is test1')
    expect(res.aapi.status).toBe('on')

    // test if add successfully
    const getResponse = await server.inject({ method: 'GET', url: '/v1/aapis' })
    expect(getResponse.statusCode).toBe(200)
    const res2: { aapis: Array<IAapi> } = JSON.parse(getResponse.body)
    expect(res2.aapis.length).toBe(1)
    expect(res2.aapis[0].title).toBe('aapi01')
    expect(res2.aapis[0].productSuite).toBe('ps01')
    expect(res2.aapis[0].product).toBe('product01')
    expect(res2.aapis[0].aapiOwner).toBe('ywchuo')
    expect(res2.aapis[0].subject).toBe('ps01.product01.user01.event01')
    expect(res2.aapis[0].doc).toBe('this is test1')
    expect(res2.aapis[0].status).toBe('on')

    
    // getById
    const getByIdResponse = await server.inject({ method: 'GET', url: `/v1/aapi/${res.aapi._id}` })
    expect(getByIdResponse.statusCode).toBe(200)
    const res3: { aapi: IAapi } = JSON.parse(getByIdResponse.body)
    expect(res3.aapi.title).toBe('aapi01')
    expect(res3.aapi.productSuite).toBe('ps01')
    expect(res3.aapi.product).toBe('product01')
    expect(res3.aapi.aapiOwner).toBe('ywchuo')
    expect(res3.aapi.subject).toBe('ps01.product01.user01.event01')
    expect(res3.aapi.doc).toBe('this is test1')
    expect(res3.aapi.status).toBe('on')

    // updateId
    const updateByIdResponse = await server.inject({
      method: 'PUT',
      url: `/v1/aapi/${res.aapi._id}`,
      payload: {
        aapiOwner: 'Jia-Wei'
      }
    })
    expect(updateByIdResponse.statusCode).toBe(200)
    const res4: { aapi: IAapi } = JSON.parse(updateByIdResponse.body)
    expect(res4.aapi.title).toBe('aapi01')
    expect(res4.aapi.productSuite).toBe('ps01')
    expect(res4.aapi.product).toBe('product01')
    expect(res4.aapi.aapiOwner).toBe('Jia-Wei')
    expect(res4.aapi.subject).toBe('ps01.product01.user01.event01')
    expect(res4.aapi.doc).toBe('this is test1')
    expect(res4.aapi.status).toBe('on')

    // deleteId
    const deleteByIdResponse = await server.inject({
      method: 'DELETE',
      url: `/v1/aapi/${res.aapi._id}`
    })
    expect(deleteByIdResponse.statusCode).toBe(204)
    // const res5: { aapi: IAapi } = JSON.parse(deleteByIdResponse.body)
    // expect(res5.aapi.title).toBe('aapi01')
    // expect(res5.aapi.productSuite).toBe('ps01')
    // expect(res5.aapi.product).toBe('product01')
    // expect(res5.aapi.aapiOwner).toBe('Jia-Wei')
    // expect(res5.aapi.subject).toBe('ps01.product01.user01.event01')
    // expect(res5.aapi.doc).toBe('this is test1')
    // expect(res5.aapi.status).toBe('on')
  })

  it('should return not found when delete a non-exist aapi', async () => {
    const fakeId = '60cabdab34b1d04cc48e01d1'
    const response = await server.inject({ method: 'DELETE', url: `/v1/aapi/${fakeId}` })

    expect(response.statusCode).toBe(404)
  })

})