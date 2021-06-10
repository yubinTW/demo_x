import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as dbHandler from './db'
import { tryCatch, match } from 'fp-ts/Either'
import { IForm } from '../types/form'

describe('Form test', () => {
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

  it('should successfully get a empty list of forms', async () => {
    const response = await server.inject({ method: 'GET', url: '/v1/forms' })

    // https://docs.nats.io/nats-server/configuration/securing_nats/accounts
    // TODO - need to discuss subscriberId (NATS: users of an account), talk to Nelson
    // for now use UUID for subscriberId
    // TODO - need to make sure if the submitter ID is Windows account
    // there will be another external service for decoding the auth token
    // data Status = Pending | Approved | Rejected
    // TODO - should a `form` be removed?
    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual(JSON.stringify({ forms: [] }))
  })

  it('should successfully post a form to mongodb and can be found', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/v1/forms',
      payload: {
        apiId: '11f88b66-c434-11eb-adaa-67fca24f6e0a',
        subscriberId: 'e574022c-c434-11eb-9d7f-9bd525bab798',
        submitUser: 'ywchuo',
        status: 'pending'
      }
    })

    expect(response.statusCode).toBe(201)

    const res: { form: IForm } = JSON.parse(response.body)
    expect(res.form.apiId).toBe('11f88b66-c434-11eb-adaa-67fca24f6e0a')
    expect(res.form.subscriberId).toBe('e574022c-c434-11eb-9d7f-9bd525bab798')
    expect(res.form.submitUser).toBe('ywchuo')
    expect(res.form.status).toBe('pending')

    // test if add successfully
    const getResponse = await server.inject({ method: 'GET', url: '/v1/forms' })
    expect(getResponse.statusCode).toBe(200)
    const res2: { forms: Array<IForm> } = JSON.parse(getResponse.body)
    expect(res2.forms.length).toBe(1)
    expect(res2.forms[0].apiId).toBe('11f88b66-c434-11eb-adaa-67fca24f6e0a')
    expect(res2.forms[0].subscriberId).toBe('e574022c-c434-11eb-9d7f-9bd525bab798')
    expect(res2.forms[0].submitUser).toBe('ywchuo')
    expect(res2.forms[0].status).toBe('pending')
  })

  // TODO: test GET /v1/form/:id
})
