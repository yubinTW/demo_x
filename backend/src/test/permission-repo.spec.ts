import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import * as O from 'fp-ts/Option'
import * as dbHandler from './db'
import * as fs from 'fs'
import { pipe } from 'fp-ts/function'
import { ioEither } from 'fp-ts'
import * as TE from 'fp-ts/TaskEither'
import { MockPermissionRepoImpl } from '../repo/permission-repo'

/**
 *
 * @group unit
 */
describe('permission repository', () => {
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

  it('should return empty authorized aapis', async () => {
    const permissionRepo = MockPermissionRepoImpl.of()
    const authorizedAapis = await permissionRepo.getAuthorizedAapisByProductSuite('foo')
    expect(authorizedAapis).toStrictEqual([])
  })

  it('should handle the permission.json from client and save into db', async () => {
    const mockPermissionDataPath = path.join(__dirname, './resources/permission.json')
    const permissionPayload = pipe(
      ioEither.tryCatch<Error, string>(
        () => fs.readFileSync(mockPermissionDataPath, 'utf8'),
        (err) => new Error(`read permission.json fail: ${err}`)
      ),
      ioEither.match<Error, string, string>(
        () => '',
        (r) => r
      )
    )()
    expect(permissionPayload.length).toBeGreaterThan(0)

    const response = await server.inject({
      method: 'POST',
      url: '/v1/permission',
      payload: JSON.parse(permissionPayload)
    })

    expect(response.statusCode).toBe(201)
    const res = JSON.parse(response.body)
    expect(res.permission.productSuite).toBe('NTAP')
    expect(res.permission.users.length).toBe(2)
    expect(res.permission.users[0].product).toBe('product01')
    expect(res.permission.users[1].user).toBe('ABB')
    expect(res.permission.users[1].productSuite).toBe('productSuite01')
    expect(res.permission.users[1].permissions.subscribes[1]).toBe('subject2')
  })
})
