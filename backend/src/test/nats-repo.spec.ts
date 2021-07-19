import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import { tryCatch, match } from 'fp-ts/Either'
import { zero } from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import * as dbHandler from './db'
import * as fs from 'fs'
import { pipe } from 'fp-ts/function'
import { ioEither, string } from 'fp-ts'
import { Exec, NatsRepoImpl } from '../repo/nats-repo'
import { PermissionRepoImpl } from '../repo/permission-repo'
import { IPermission } from '../types/permission'
import util from 'util'

const readFileAsString = (filename:string):string => {
  const filePath = path.join(__dirname, filename)
  const stringContent = pipe(
    ioEither.tryCatch<Error, string>(
      () => fs.readFileSync(filePath, 'utf8'),
      (err) => new Error(`read file fail: ${err}`)
    ),
    ioEither.match<Error, string, string>(
      () => '',
      (r) => r
    )
  )()
  return stringContent
}


describe('permission repository', () => {
  //   let server: FastifyInstance<Server, IncomingMessage, ServerResponse>
  beforeAll(async () => {
    await dbHandler.connect()
    // server = startFastify(fastifyPortOf(8888))
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
          // server.close((): void => {})
        },
        (reason) => new Error(`Failed to close a Fastify server, reason: ${reason}`)
      )
    )
    const natsRepo = NatsRepoImpl.of()
    await natsRepo.clearRevocationsList('ps01')
    await natsRepo.clearRevocationsList('ps02')
    await natsRepo.deleteAccount('ps01')
    await natsRepo.deleteAccount('ps02')
  })

  it('should fail when execute a wrong command', async () => {
    try {
      await Exec(`fooo`)
    } catch (err) {
      console.log(`${err}`)
      expect(err).toBeDefined()
    }
  })

  it('should return nsc version', async () => {
    const natsRepo = NatsRepoImpl.of()
    const version = await natsRepo.getVersion()
    console.log('version = ', version)
    expect(version.includes('nsc version')).toBe(true)
  })

  it('should return false when check a nonexist account', async () => {
    const natsRepo = NatsRepoImpl.of()
    const isExistAccount = await natsRepo.isExistAccount('foo')
    expect(isExistAccount).toBe(false)
  })

  it('should add an account and delete it sucessfully', async () => {
    const natsRepo = NatsRepoImpl.of()
    const addResponse = await natsRepo.addAccount('ps01')
    console.log('addResponse = ', addResponse)
    expect(addResponse).toBe(true)
    const isExist = await natsRepo.isExistAccount('ps01')
    expect(isExist).toBe(true)
    const deleteResponse = await natsRepo.deleteAccount('ps01')
    expect(deleteResponse).toBe(true)
  })

  it('should return false when check a nonexist user', async () => {
    const natsRepo = NatsRepoImpl.of()
    const isExist = await natsRepo.isExistUser('ps01', 'fooUser')
    expect(isExist).toBe(false)
  })

  it('should add and delete a user successfully', async () => {
    const natsRepo = NatsRepoImpl.of()
    if ((await natsRepo.isExistAccount('ps01')) === false) {
      const addAccountResponse = await natsRepo.addAccount('ps01')
      expect(addAccountResponse).toBe(true)
    }
    const addUserResponse = await natsRepo.addUser('ps01', 'user01', ['ps01.product01.*', 'ps01.product02.>'])
    console.log('addUserResponse = ', addUserResponse)
    expect(addUserResponse.publicKey).toBeTruthy()
    expect(addUserResponse.credsFile).toBeTruthy()
    const deleteUserResponse = await natsRepo.deleteUser('ps01', 'user01')
    expect(deleteUserResponse).toBe(true)
    const deleteAccountResponse = await natsRepo.deleteAccount('ps01')
    expect(deleteAccountResponse).toBe(true)
  })

  it('should return an empty revocations list', async () => {
    const natsRepo = NatsRepoImpl.of()
    await natsRepo.addAccount('ps01')
    const res = await natsRepo.getRevocationsList('ps01')
    expect(res.length).toBe(0)
  })

  it('should return an empty revocations list', async () => {
    const natsRepo = NatsRepoImpl.of()
    await natsRepo.addAccount('ps01')
    await natsRepo.addUser('ps01', 'user01')
    await natsRepo.addUser('ps01', 'user02')
    await natsRepo.revokeUser('ps01', 'user01')
    await natsRepo.revokeUser('ps01', 'user02')
    const res = await natsRepo.getRevocationsList('ps01')
    console.log('res = ', res)
    expect(res.length).toBe(2)
    await natsRepo.deleteUser('ps01', 'user01')
    await natsRepo.deleteUser('ps01', 'user02')
    await natsRepo.deleteAccount('ps01')
  })

  it('should revoke and active an user successfully', async () => {
    const natsRepo = NatsRepoImpl.of()
    if ((await natsRepo.isExistAccount('ps01')) === false) {
      const addAccountResponse = await natsRepo.addAccount('ps01')
      expect(addAccountResponse).toBe(true)
    }
    const addUserResponse = await natsRepo.addUser('ps01', 'user01', ['ps01.product01.*', 'ps01.product02.>'])
    console.log('addUserResponse = ', addUserResponse)
    expect(addUserResponse.publicKey).toBeTruthy()
    expect(addUserResponse.credsFile).toBeTruthy()
    const revokeResponse = await natsRepo.revokeUser('ps01', 'user01')
    expect(revokeResponse).toBe(true)
    const activeResponse = await natsRepo.activeUser('ps01', 'user01')
    expect(activeResponse).toBe(true)
    const deleteUserResponse = await natsRepo.deleteUser('ps01', 'user01')
    expect(deleteUserResponse).toBe(true)
    const deleteAccountResponse = await natsRepo.deleteAccount('ps01')
    expect(deleteAccountResponse).toBe(true)
  })

  it('should handle permission successfully', async () => {
    const permissionPayload = readFileAsString('./resources/permission-1.json')
    expect(permissionPayload.length).toBeGreaterThan(0)

    const natsRepo = NatsRepoImpl.of()
    const permission: IPermission = JSON.parse(permissionPayload)
    const handleResult = await natsRepo.handlePermission(permission)
    expect(handleResult).toBe(true)

    // check data store
    const permissionRepo = PermissionRepoImpl.of()
    const p = await pipe(
      TE.match<Error, O.Option<Readonly<IPermission>>,  O.Option<Readonly<IPermission>>>(
        e => O.none,
        r => r
      )
    )(permissionRepo.getPermissionByProductSuite('ps02'))()

    O.match<Readonly<IPermission>, void>(
      () => {
        console.error('getPermissionByProductSuite fail')
      },
      s => {
        // check store in db successfully
        expect(s.productSuite).toBe('ps02')
        expect(s.users).toHaveLength(1)
        expect(s.users[0].user).toBe('user01')
        expect(s.users[0].status).toBe('Active')
        expect(s.users[0].publicKey).toBeTruthy()
        expect(s.users[0].credsFile).toBeTruthy()
        expect(s.users[0].permissions.subscribes).toHaveLength(2)
        expect(s.users[0].permissions.subscribes[0]).toBe('ps02.product01.subject01.*')
        expect(s.users[0].permissions.subscribes[1]).toBe('ps02.product02.>')
        console.log('dump s = ')
        console.log(util.inspect(s, true, null, true))
      }
    )(p)
    // check by nsc
    const isExistAccount = await natsRepo.isExistAccount('ps02')
    expect(isExistAccount).toBe(true)
    const isExistUser = await natsRepo.isExistUser('ps02','user01')
    expect(isExistUser).toBe(true)
    const userSubs = await natsRepo.getUserSubs('ps02', 'user01')
    expect(userSubs).toHaveLength(2)
    expect(userSubs[0]).toBe('ps02.product01.subject01.*')
    expect(userSubs[1]).toBe('ps02.product02.>')
    const revocations = await natsRepo.getRevocationsList('ps02')
    expect(revocations).toHaveLength(0)

    // permission-2.json: revoke user01
    const permissionPayload2 = readFileAsString('./resources/permission-2.json')
    expect(permissionPayload2.length).toBeGreaterThan(0)
    const permission2: IPermission = JSON.parse(permissionPayload2)
    const handleResult2 = await natsRepo.handlePermission(permission2)
    expect(handleResult2).toBe(true)

    // check data store
    const p2 = await pipe(
      TE.match<Error, O.Option<Readonly<IPermission>>,  O.Option<Readonly<IPermission>>>(
        e => O.none,
        r => r
      )
    )(permissionRepo.getPermissionByProductSuite('ps02'))()

    O.match<Readonly<IPermission>, void>(
      () => {
        console.error('getPermissionByProductSuite fail')
      },
      s => {
        expect(s.productSuite).toBe('ps02')
        expect(s.users).toHaveLength(1)
        expect(s.users[0].user).toBe('user01')
        expect(s.users[0].status).toBe('Revoke')
        expect(s.users[0].publicKey).toBeTruthy()
        expect(s.users[0].credsFile).toBeTruthy()
        expect(s.users[0].permissions.subscribes).toHaveLength(2)
        expect(s.users[0].permissions.subscribes[0]).toBe('ps02.product01.subject01.*')
        expect(s.users[0].permissions.subscribes[1]).toBe('ps02.product02.>')
        console.log('dump s = ')
        console.log(util.inspect(s, true, null, true))
      }
    )(p2)

    // check by nsc
    const revocations2 = await natsRepo.getRevocationsList('ps02')
    expect(revocations2).toHaveLength(1)

    // permission-3: active user01 and modify subs
    const permissionPayload3 = readFileAsString('./resources/permission-3.json')
    expect(permissionPayload3.length).toBeGreaterThan(0)
    const permission3: IPermission = JSON.parse(permissionPayload3)
    const handleResult3 = await natsRepo.handlePermission(permission3)
    expect(handleResult3).toBe(true)
    const revocations3 = await natsRepo.getRevocationsList('ps02')
    expect(revocations3).toHaveLength(0)
    const userSubs2 = await natsRepo.getUserSubs('ps02', 'user01')
    expect(userSubs2).toHaveLength(1)

    // permission-4: add user02
    const permissionPayload4 = readFileAsString('./resources/permission-4.json')
    expect(permissionPayload4.length).toBeGreaterThan(0)
    const permission4: IPermission = JSON.parse(permissionPayload4)
    const handleResult4 = await natsRepo.handlePermission(permission4)
    expect(handleResult4).toBe(true)

    // check by nsc
    const user02Exist = await natsRepo.isExistUser('ps02', 'user02')
    const user02Subs = await natsRepo.getUserSubs('ps02', 'user02')
    expect(user02Subs).toHaveLength(1)
    const revocations4 = await natsRepo.getRevocationsList('ps02')
    expect(revocations4).toHaveLength(0)
    
  })

})
