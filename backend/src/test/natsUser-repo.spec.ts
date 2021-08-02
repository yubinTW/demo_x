import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import * as dbHandler from './db'
import { pipe } from 'fp-ts/function'
import { NatsUserRepoImpl } from '../repo/natsUser-repo'
import { INatsUser } from '../types/natsUser'

/**
 *
 * @group ci
 */
describe('NatsUserRepo CRU', () => {
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

  it('should return empty array when there is no natsUser', async () => {
    const natsUserRepo: NatsUserRepoImpl = NatsUserRepoImpl.of()

    await pipe(
      natsUserRepo.getNatsUsers('ps01'),
      TE.match<Error, void, O.Option<Readonly<Array<INatsUser>>>>(
        (e) => console.error(`getNatsUsers fail: ${e}`),
        (r) => {
          pipe(
            r,
            O.map((s) => {
              expect(s).toStrictEqual([])
            })
          )
        }
      )
    )()
  })

  it('should add a natsUser and query successfully', async () => {
    const natsUserRepo: NatsUserRepoImpl = NatsUserRepoImpl.of()
    const user: INatsUser = {
      account: 'account01',
      user: 'user01',
      productSuite: 'ps01',
      product: 'product01',
      status: 'Active',
      permissions: {
        subscribes: ['ps01.product01.*', 'ps01.product01.subject01.>']
      }
    }
    await pipe(
      natsUserRepo.addNatsUser(user),
      TE.match<Error, void, INatsUser>(
        (e) => console.error(`addNatsUser error: ${e}`),
        (r) => {
          expect(r).toBeTruthy()
          expect(r.account).toBe('account01')
          expect(r.user).toBe('user01')
          expect(r.productSuite).toBe('ps01')
          expect(r.product).toBe('product01')
          expect(r.status).toBe('Active')
          expect(r.permissions.subscribes).toHaveLength(2)
          expect(r.permissions.subscribes[0]).toBe('ps01.product01.*')
          expect(r.permissions.subscribes[1]).toBe('ps01.product01.subject01.>')
        }
      )
    )()

    await pipe(
      natsUserRepo.getNatsUser('ps01', 'user01'),
      TE.match<Error, void, O.Option<Readonly<INatsUser>>>(
        (e) => console.error(`getNatsUser error: ${e}`),
        (r) => {
          pipe(
            r,
            O.map((s) => {
              expect(s).toBeTruthy()
              expect(s.account).toBe('account01')
              expect(s.productSuite).toBe('ps01')
              expect(s.product).toBe('product01')
              expect(s.user).toBe('user01')
              expect(s.status).toBe('Active')
            })
          )
        }
      )
    )()

    await pipe(
      natsUserRepo.getNatsUsers('account01'),
      TE.match<Error, void, O.Option<Readonly<Array<INatsUser>>>>(
        (e) => console.error(`getNatsUsers error: ${e}`),
        (r) => {
          pipe(
            r,
            O.map((s) => {
              expect(s).toBeTruthy()
              expect(s).toHaveLength(1)
              expect(s[0].account).toBe('account01')
              expect(s[0].productSuite).toBe('ps01')
              expect(s[0].product).toBe('product01')
              expect(s[0].user).toBe('user01')
              expect(s[0].status).toBe('Active')
            })
          )
        }
      )
    )()
  })

  it('should return O.none when query a non-exist natsUser', async () => {
    const natsUserRepo: NatsUserRepoImpl = NatsUserRepoImpl.of()
    await pipe(
      natsUserRepo.getNatsUser('foo', 'bar'),
      TE.match(
        (e) => console.error(`getNatsUser error: ${e}`),
        (r) => {
          expect(O.isNone(r)).toBe(true)
        }
      )
    )()
  })

  it('should update a natsUser successfully', async () => {
    const natsUserRepo: NatsUserRepoImpl = NatsUserRepoImpl.of()
    const user: INatsUser = {
      account: 'account01',
      user: 'user01',
      productSuite: 'ps01',
      product: 'product01',
      status: 'Active',
      permissions: {
        subscribes: []
      }
    }
    await pipe(
      natsUserRepo.addNatsUser(user),
      TE.match<Error, void, INatsUser>(
        (e) => console.error(`addNatsUser error: ${e}`),
        (r) => {
          expect(r).toBeTruthy()
        }
      )
    )()

    user.status = 'Revoke'
    await pipe(
      natsUserRepo.updateNatsUser(user),
      TE.match(
        (e) => console.error(`updateNatsUser error: ${e}`),
        (r) => {
          pipe(
            r,
            O.map((s) => {
              expect(s).toBeTruthy(), expect(s.status).toBe('Revoke')
            })
          )
        }
      )
    )()
  })

  it('should delete a natsUser successfully', async () => {
    const natsUserRepo: NatsUserRepoImpl = NatsUserRepoImpl.of()
    const user: INatsUser = {
      account: 'account01',
      user: 'user01',
      productSuite: 'ps01',
      product: 'product01',
      status: 'Active',
      permissions: {
        subscribes: []
      }
    }
    await pipe(
      natsUserRepo.addNatsUser(user),
      TE.match<Error, void, INatsUser>(
        (e) => console.error(`addNatsUser error: ${e}`),
        (r) => {
          expect(r).toBeTruthy()
        }
      )
    )()

    await pipe(
      natsUserRepo.deleteNatsUser('account01', 'user01'),
      TE.match(
        (e) => console.error(`updateNatsUser error: ${e}`),
        (r) => {
          pipe(
            r,
            O.map((s) => {
              expect(s).toBeTruthy()
            })
          )
        }
      )
    )()

    await pipe(
      natsUserRepo.getNatsUser('account01', 'user01'),
      TE.match(
        (error) => console.error(`getNatsUser error: ${error}`),
        (r) => {
          expect(O.isNone(r)).toBe(true)
        }
      )
    )()
  })

  it('delete a non-exist user', async () => {
    const natsUserRepo: NatsUserRepoImpl = NatsUserRepoImpl.of()
    await pipe(
      natsUserRepo.deleteNatsUser('account01', 'user01'),
      TE.match(
        (e) => console.error(`${e}`),
        (r) => {
          expect(O.isNone(r)).toBe(true)
        }
      )
    )()
  })
})
