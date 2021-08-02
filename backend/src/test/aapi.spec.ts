/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as dbHandler from './db'
import * as TE from 'fp-ts/TaskEither'
import { IAapi, EventBody } from '../types/aapi'
import { psSummaryItem } from '../types/productSuite'
import { pipe } from 'fp-ts/function'

/**
 *
 * @group ci
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
        description: 'test',
        productSuite: 'ps01',
        product: 'product01',
        aapiOwner: 'ywchuo',
        subject: 'ps01.product01.user01.event01',
        doc: 'this is test1',
        subscribers: [{ name: 'jwlinv' }],
        status: 'on'
      }
    })

    expect(response.statusCode).toBe(201)

    const res: { aapi: IAapi } = JSON.parse(response.body)
    expect(res.aapi.title).toBe('aapi01')
    expect(res.aapi.description).toBe('test')
    expect(res.aapi.productSuite).toBe('ps01')
    expect(res.aapi.product).toBe('product01')
    expect(res.aapi.aapiOwner).toBe('ywchuo')
    expect(res.aapi.subject).toBe('ps01.product01.user01.event01')
    expect(res.aapi.doc).toBe('this is test1')
    expect(res.aapi.subscribers.length).toBe(1)
    expect(res.aapi.subscribers[0].name).toBe('jwlinv')
    expect(res.aapi.status).toBe('on')

    // test if add successfully
    const getResponse = await server.inject({ method: 'GET', url: '/v1/aapis' })
    expect(getResponse.statusCode).toBe(200)
    const res2: { aapis: Array<IAapi> } = JSON.parse(getResponse.body)
    expect(res2.aapis.length).toBe(1)
    expect(res2.aapis[0].title).toBe('aapi01')
    expect(res2.aapis[0].description).toBe('test')
    expect(res2.aapis[0].productSuite).toBe('ps01')
    expect(res2.aapis[0].product).toBe('product01')
    expect(res2.aapis[0].aapiOwner).toBe('ywchuo')
    expect(res2.aapis[0].subject).toBe('ps01.product01.user01.event01')
    expect(res2.aapis[0].doc).toBe('this is test1')
    expect(res2.aapis[0].subscribers.length).toBe(1)
    expect(res2.aapis[0].subscribers[0].name).toBe('jwlinv')
    expect(res2.aapis[0].status).toBe('on')

    // getById
    const getByIdResponse = await server.inject({ method: 'GET', url: `/v1/aapi/${res.aapi._id}` })
    expect(getByIdResponse.statusCode).toBe(200)
    const res3: { aapi: IAapi } = JSON.parse(getByIdResponse.body)
    expect(res3.aapi.title).toBe('aapi01')
    expect(res3.aapi.description).toBe('test')
    expect(res3.aapi.productSuite).toBe('ps01')
    expect(res3.aapi.product).toBe('product01')
    expect(res3.aapi.aapiOwner).toBe('ywchuo')
    expect(res3.aapi.subject).toBe('ps01.product01.user01.event01')
    expect(res3.aapi.doc).toBe('this is test1')
    expect(res3.aapi.subscribers.length).toBe(1)
    expect(res3.aapi.subscribers[0].name).toBe('jwlinv')
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
    expect(res4.aapi.description).toBe('test')
    expect(res4.aapi.productSuite).toBe('ps01')
    expect(res4.aapi.product).toBe('product01')
    expect(res4.aapi.aapiOwner).toBe('Jia-Wei')
    expect(res4.aapi.subject).toBe('ps01.product01.user01.event01')
    expect(res4.aapi.doc).toBe('this is test1')
    expect(res4.aapi.subscribers.length).toBe(1)
    expect(res4.aapi.subscribers[0].name).toBe('jwlinv')
    expect(res4.aapi.status).toBe('on')

    // deleteId
    const deleteByIdResponse = await server.inject({
      method: 'DELETE',
      url: `/v1/aapi/${res.aapi._id}`
    })
    expect(deleteByIdResponse.statusCode).toBe(204)
  })

  it('should return Bad Request when get an invalid id of an aapi', async () => {
    const fakeId = 'foo'
    const response = await server.inject({ method: 'GET', url: `/v1/aapi/${fakeId}` })

    expect(response.statusCode).toBe(400)
  })

  it('should return Bad Request when update an invalid id of an aapi', async () => {
    const fakeId = 'foo'
    const response = await server.inject({ method: 'PUT', url: `/v1/aapi/${fakeId}` })

    expect(response.statusCode).toBe(400)
  })

  it('should return Bad Request when delete an invalid id of an aapi', async () => {
    const fakeId = 'foo'
    const response = await server.inject({ method: 'DELETE', url: `/v1/aapi/${fakeId}` })

    expect(response.statusCode).toBe(400)
  })

  it('should return Not Found when get an invalid id of an aapi', async () => {
    const fakeId = '60cabdab34b1d04cc48e01d1'
    const response = await server.inject({ method: 'GET', url: `/v1/aapi/${fakeId}` })

    expect(response.statusCode).toBe(404)
  })

  it('should return Not Found when update an invalid id of an aapi', async () => {
    const fakeId = '60cabdab34b1d04cc48e01d1'
    const response = await server.inject({ method: 'PUT', url: `/v1/aapi/${fakeId}` })

    expect(response.statusCode).toBe(404)
  })

  it('should return Not Found when delete a non-exist aapi', async () => {
    const fakeId = '60cabdab34b1d04cc48e01d1'
    const response = await server.inject({ method: 'DELETE', url: `/v1/aapi/${fakeId}` })

    expect(response.statusCode).toBe(404)
  })

  it('should return empty array when get /v1/product-suite', async () => {
    const response = await server.inject({ method: 'GET', url: `/v1/product-suite` })
    expect(response.statusCode).toBe(200)
    const resultData = JSON.parse(response.body)
    expect(resultData['aapis'].length).toBe(0)
  })

  it('should return psSummaryItem list', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/v1/aapi',
      payload: {
        title: 'aapi01',
        description: 'test',
        productSuite: 'ps01',
        product: 'product01',
        aapiOwner: 'ywchuo',
        subject: 'ps01.product01.user01.event01',
        doc: 'this is test1',
        subscribers: [{ name: 'jwlinv' }],
        status: 'on'
      }
    })

    const getResponse = await server.inject({ method: 'GET', url: '/v1/product-suite' })
    expect(getResponse.statusCode).toBe(200)
    const res: { aapis: Array<psSummaryItem> } = JSON.parse(getResponse.body)
    expect(res.aapis.length).toBe(1)
    expect(res.aapis[0].title).toBe('aapi01')
    expect(res.aapis[0].description).toBe('test')
    expect(res.aapis[0].productSuite).toBe('ps01')
    expect(res.aapis[0].product).toBe('product01')
    expect(res.aapis[0].aapiOwner).toBe('ywchuo')
  })

  it('should return empty EventBody', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/v1/my-event'
    })
    expect(response.statusCode).toBe(200)
    const res: { event: EventBody } = JSON.parse(response.body)
    expect(res.event.own).toStrictEqual([])
    expect(res.event.subscribe).toStrictEqual([])
  })

  it('should get myevent, after create aapi data', async () => {
    await server.inject({
      method: 'POST',
      url: '/v1/aapi',
      payload: {
        title: 'aapi01',
        description: 'test',
        productSuite: 'ps01',
        product: 'product01',
        aapiOwner: 'YWCHUO',
        subject: 'ps01.product01.user01.event01',
        doc: 'this is test1',
        subscribers: [{ name: 'jwlinb' }],
        status: 'on'
      }
    })

    await server.inject({
      method: 'POST',
      url: '/v1/aapi',
      payload: {
        title: 'aapi02',
        description: 'test',
        productSuite: 'ps02',
        product: 'product02',
        aapiOwner: 'JWLINV',
        subject: 'ps02.product02.user02.event02',
        doc: 'this is test2',
        subscribers: [{ name: 'jwlinc' }],
        status: 'on'
      }
    })

    await server.inject({
      method: 'POST',
      url: '/v1/aapi',
      payload: {
        title: 'aapi03',
        description: 'test',
        productSuite: 'NTAP',
        product: 'product03',
        aapiOwner: 'LC',
        subject: 'NTAP.product03.user03.event03',
        doc: 'this is test3',
        subscribers: [{ name: 'jwlind' }],
        status: 'on'
      }
    })

    await server.inject({
      method: 'POST',
      url: '/v1/aapi',
      payload: {
        title: 'aapi04',
        description: 'test',
        productSuite: 'NTAP',
        product: 'product04',
        aapiOwner: 'YBHSU',
        subject: 'NTAP.product04.user04.event04',
        doc: 'this is test4',
        subscribers: [{ name: 'jwlind' }],
        status: 'on'
      }
    })

    const response = await server.inject({
      method: 'GET',
      url: '/v1/my-event'
    })

    // current user: JWLINV, is the productSuite owner of NATP
    // current productSuite of user: NTAP
    process.env.loginUser = 'JWLINV'

    expect(response.statusCode).toBe(200)
    const res: { event: EventBody } = JSON.parse(response.body)

    expect(res.event.own.filter((obj) => obj.aapiOwner === 'JWLINV').length).toBe(1)
    expect(res.event.own.filter((obj) => obj.productSuite === 'NTAP').length).toBe(2)
    expect(res.event.own.filter((obj) => obj.title === 'aapi01').length).toBe(0)
    expect(res.event.own.filter((obj) => obj.title === 'aapi02').length).toBe(1)
    expect(res.event.own.filter((obj) => obj.title === 'aapi03').length).toBe(1)
    expect(res.event.own.filter((obj) => obj.title === 'aapi04').length).toBe(1)

    // test for subscribe aapi
    // Scenario 1: 我是同一個 Product Suite 的 developer

    expect(res.event.subscribe.filter((obj) => obj.title === 'aapi04').length).toBe(1)

    // current user: YBHSU, is the developer of NATP, and own aapi04
    // current productSuite of user: NTAP
    process.env.loginUser = 'YBHSU'
    const response2 = await server.inject({
      method: 'GET',
      url: '/v1/my-event'
    })
    expect(response2.statusCode).toBe(200)
    const res2: { event: EventBody } = JSON.parse(response2.body)
    expect(res2.event.own.length).toBe(1)
    expect(res2.event.own.filter((obj) => obj.title === 'aapi01').length).toBe(0)
    expect(res2.event.own.filter((obj) => obj.title === 'aapi02').length).toBe(0)
    expect(res2.event.own.filter((obj) => obj.title === 'aapi03').length).toBe(0)
    expect(res2.event.own.filter((obj) => obj.title === 'aapi04').length).toBe(1)
    expect(res2.event.subscribe.filter((obj) => obj.productSuite === 'NTAP').length).toBe(1)
    expect(res2.event.subscribe.filter((obj) => obj.title === 'aapi01').length).toBe(0)
    expect(res2.event.subscribe.filter((obj) => obj.title === 'aapi02').length).toBe(0)
    expect(res2.event.subscribe.filter((obj) => obj.title === 'aapi03').length).toBe(1)
    expect(res2.event.subscribe.filter((obj) => obj.title === 'aapi04').length).toBe(0)

    // test for subscribe aapi
    // Scenario 2: 另一個使用者，沒有任何 own 權限，該使用者的 productSuite 被授權使用 aapi01
    console.log('developer01 start testing ...')
    process.env.loginUser = 'developer01'
    const response3 = await server.inject({
      method: 'GET',
      url: '/v1/my-event'
    })
    expect(response3.statusCode).toBe(200)
    const res3: { event: EventBody } = JSON.parse(response3.body)
    expect(res3.event.own.length).toBe(0)
    expect(res3.event.own.filter((obj) => obj.title === 'aapi01').length).toBe(0)
    expect(res3.event.own.filter((obj) => obj.title === 'aapi02').length).toBe(0)
    expect(res3.event.own.filter((obj) => obj.title === 'aapi03').length).toBe(0)
    expect(res3.event.own.filter((obj) => obj.title === 'aapi04').length).toBe(0)
    expect(res3.event.subscribe.filter((obj) => obj.title === 'aapi01').length).toBe(1)
    expect(res3.event.subscribe.filter((obj) => obj.title === 'aapi02').length).toBe(0)
    expect(res3.event.subscribe.filter((obj) => obj.title === 'aapi03').length).toBe(0)
    expect(res3.event.subscribe.filter((obj) => obj.title === 'aapi04').length).toBe(0)
  })
})
