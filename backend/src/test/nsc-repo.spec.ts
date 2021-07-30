import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { tryCatch, match } from 'fp-ts/Either'
import { zero } from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import * as dbHandler from './db'
import { pipe } from 'fp-ts/function'
import { NscRepoImpl } from '../repo/nsc-repo'

/**
 *
 * @group nats
 */
describe('NscRepo spec', () => {
  beforeAll(async () => {})

  afterEach(async () => {})

  afterAll(async () => {})

  it('should return nsc version successfully', async () => {
    const nscRepo: NscRepoImpl = NscRepoImpl.of()

    await pipe(
      nscRepo.getVersion(),
      TE.match<Error, void, string>(
        (e) => {
          fail(`getVersion fail: ${e.message}`)
        },
        (r) => {
          expect(r).toContain('nsc version')
        }
      )
    )()
  })
  it('should set the operator successfully', async () => {
    const nscRepo: NscRepoImpl = NscRepoImpl.of()
    await pipe(
      nscRepo.setOperator('operator01'),
      TE.match(
        (e) => console.error(`setOperator fail: ${e}`),
        (r) => {
          expect(r).toContain('operator01')
        }
      )
    )()
  })

  it('should set the JWT server successfully', async () => {
    const nscRepo: NscRepoImpl = NscRepoImpl.of()
    await pipe(
      nscRepo.setJwtServerUrl('http://localhost:4222'),
      TE.match(
        (e) => console.error(`setJwtServerUrl fail: ${e}`),
        (r) => {
          expect(r).toContain('OK')
        }
      )
    )()
  })

  it('should fail when set a empty operator', async () => {
    const nscRepo: NscRepoImpl = NscRepoImpl.of()
    await pipe(
      nscRepo.setOperator(''),
      TE.match(
        (e) => expect(e).toBeDefined(),
        (r) => r
      )
    )()
  })

  it('should add an account successfully', async () => {
    const nscRepo: NscRepoImpl = NscRepoImpl.of()
    await pipe(
      nscRepo.addAccount('account01'),
      TE.match<Error, void, string>(
        (e) => console.error(`${e}`),
        (r) => {
          expect(r).toContain('OK')
        }
      )
    )()
  })

  it('should return true when query an exist account', async () => {
    const nscRepo: NscRepoImpl = NscRepoImpl.of()
    await pipe(
      nscRepo.isExistAccount('account01'),
      TE.match<Error, void, boolean>(
        (e) => {
          expect(e).not.toBeDefined()
          console.error(`${e}`)
        },
        (r) => {
          expect(r).toBe(true)
        }
      )
    )()
  })

  it('should execute nsc push successfully', async () => {
    const nscRepo: NscRepoImpl = NscRepoImpl.of()
    await pipe(
      nscRepo.nscPush('account01'),
      TE.match<Error, void, string>(
        (e) => {
          expect(e).not.toBeDefined()
        },
        (r) => {
          expect(r).toContain('OK')
        }
      )
    )()
  })

  it('should get empty array when no user in revocation list', async () => {
    const nscRepo: NscRepoImpl = NscRepoImpl.of()
    const revocationList = await pipe(
      nscRepo.getRevocationsList('account01'),
      TE.match<Error, Array<string>, Array<string>>(
        (e) => {
          expect(e.message).toContain('does not have revoked users')
          return []
        },
        (r) => r
      )
    )()
    expect(revocationList).toStrictEqual([])
  })

  it('should delete an account successfully', async () => {
    const nscRepo: NscRepoImpl = NscRepoImpl.of()
    await pipe(
      nscRepo.deleteAccount('account01'),
      TE.match<Error, void, string>(
        (e) => {
          console.error(`${e}`)
          expect(e).not.toBeDefined()
        },
        (r) => {
          expect(r).toContain('OK')
        }
      )
    )()
  })
})
