import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import { zero } from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import { exec } from 'child_process'
import { IPermission, NatsUser, PermissionOfEmpty } from '../types/permission'
import { PermissionRepoImpl } from './permission-repo'
import util from 'util'

interface NatsRepo {}

type NatsUserInfo = {
  publicKey: string
  credsFile: string
}

const commandPrefix = 'docker exec -t natsbox'

const Exec = (command: string): Promise<string> => {
  return new Promise<string>((done, _) => {
    exec(`${commandPrefix} ${command}`, (err, stdout, _) => {
      O.match(
        () => done(stdout),
        (e) => done(`${e}`)
      )(O.fromNullable(err))
    })
  })
}

const permissionRepo = PermissionRepoImpl.of()

// TODO: pull when init
class NatsRepoImpl implements NatsRepo {
  private static instance: NatsRepoImpl
  private constructor() {}

  static of(): NatsRepoImpl {
    return O.getOrElse(() => new NatsRepoImpl())(O.fromNullable(NatsRepoImpl.instance))
  }

  async setJwtServerUrl(url: string): Promise<any> {
    const res = await Exec(`nsc edit operator -u ${url}`)
    return O.match(
      () => Promise.reject(`Set JWT server url error: ${res}`),
      () => Promise.resolve(res)
    )(O.fromNullable(res.includes('[ OK ] set account jwt server url')))
  }

  async setOperator(operator: string): Promise<any> {
    const res = await Exec(`nsc env -o ${operator}`)
    return O.match(
      () => Promise.resolve(res),
      () => Promise.reject(`Set operator error: ${res}`)
    )(O.fromNullable(res.includes('Error')))
  }

  async nscPush(account: string): Promise<any> {
    const res = await Exec(`nsc push -a ${account}`)
    return O.match(
      () => Promise.resolve(res),
      () => Promise.reject(`Set operator error: ${res}`)
    )(O.fromNullable(res.includes('Error')))
  }

  async nscPull(): Promise<any> {
    const res = await Exec(`nsc pull --all`)
    return Promise.resolve()
  }

  async getVersion(): Promise<string> {
    const res = await Exec(`nsc --version`)
    return O.match(
      () => Promise.reject(`Get nsc version error: ${res}`),
      () => Promise.resolve(res)
    )(O.fromNullable(res.includes('nsc version')))
  }

  async addAccount(account: string): Promise<boolean> {
    const res = await Exec(`nsc add account ${account}`)
    return O.match(
      () => Promise.reject(`Add account error: ${res}`),
      () => Promise.resolve(true)
    )(O.fromNullable(res.includes('[ OK ] added account')))
  }

  async isExistAccount(account: string): Promise<boolean> {
    const res = await Exec(`nsc describe account ${account}`)
    return Promise.resolve(res.includes('Account Details'))
  }

  async deleteAccount(account: string): Promise<boolean> {
    const res = await Exec(`nsc delete account ${account}`)
    return O.match(
      () => Promise.reject(`Delete account error: ${res}`),
      () => Promise.resolve(true)
    )(O.fromNullable(res.includes('[ OK ] deleted account')))
  }

  async revokeUser(account: string, user: string): Promise<boolean> {
    const res = await Exec(`nsc revocations add-user -a ${account} -n ${user}`)
    return O.match(
      () => Promise.reject(`Revoke user error: ${res}`),
      () => Promise.resolve(true)
    )(O.fromNullable(res.includes('[ OK ] revoked user')))
  }

  async activeUser(account: string, user: string): Promise<boolean> {
    const res = await Exec(`nsc revocations delete-user -a ${account} -n ${user}`)
    return O.match(
      () => Promise.reject(`Active user error: ${res}`),
      () => Promise.resolve(true)
    )(O.fromNullable(res.includes('[ OK ] deleted user revocation')))
  }

  async getRevocationsList(account: string): Promise<Array<string>> {
    const res = await Exec(`nsc revocations list-users -a ${account}`)
    const keys = res.match(/\w{56}/g)
    //   console.log('keys = ', keys)
    const result: Array<string> = []
    keys?.map((key) => result.push(key))
    return result
  }

  async clearRevocationsList(account: string): Promise<boolean> {
    const publicKeys = await this.getRevocationsList(account)
    await Promise.all(
      publicKeys.map(async (pk) => {
        await Exec(`nsc revocations delete-user -u ${pk}`)
      })
    )
    return Promise.resolve(true)
  }

  async isExistUser(account: string, user: string): Promise<boolean> {
    const res = await Exec(`nsc describe user -a ${account} -n ${user}`)
    return Promise.resolve(res.includes('User ID'))
  }

  async getUserSubs(account: string, user: string): Promise<Array<string>> {
    try {
      const res = await Exec(`nsc describe user -a ${account} -n ${user} --json`)
      const j = JSON.parse(res)
      if (j.nats.sub) {
        return Promise.resolve(j.nats.sub.allow)
      }
      return Promise.resolve([])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async addUser(account: string, user: string, subjects: Array<string> = []): Promise<NatsUserInfo> {
    const allowSubs = subjects.join(',')
    console.log('allowSubs = ', allowSubs)
    const isExist = await this.isExistAccount(account)
    return await O.match(
      () => Promise.reject(`NATS Account '${account}' is not exist`),
      async () => {
        const res = await Exec(`nsc add user -a ${account} -n ${user} --allow-sub '${allowSubs}'`)
        console.log('addUser res = ', res)
        return O.match(
          () => Promise.reject(`Add user error: ${res}`),
          () => {
            const resArr = res.split('\n')
            const userInfo = {
              publicKey: '',
              credsFile: ''
            } as NatsUserInfo
            resArr.forEach((line) => {
              if (line.includes('user key')) {
                const match = line.match(/(\w{56})/)
                const publicKey = match ? match[1] : ''
                console.log('user key = ', publicKey)
                userInfo.publicKey = publicKey
              }
              if (line.includes('creds file')) {
                const match = line.match(/`(\S*)`/)
                const credsFile = match ? match[1] : ''
                console.log('credsFile = ', credsFile)
                userInfo.credsFile = credsFile
              }
            })
            return Promise.resolve(userInfo)
          }
        )(O.fromNullable(res.includes('[ OK ] added user')))
      }
    )(O.fromNullable(isExist))
  }

  async editUser(
    account: string,
    user: string,
    allowSubjects: Array<string> = [],
    rmSubjects: Array<string> = []
  ): Promise<any> {
    const allowSubs = allowSubjects.join(',')
    const rmSubs = rmSubjects.join(',')
    const res = await Exec(`nsc edit user -a ${account} -n ${user} --allow-sub '${allowSubs}' --rm '${rmSubs}'`)
    if (res.includes('[ OK ] edited user')) {
      return Promise.resolve(true)
    } else {
      return Promise.reject(`Edit user fail: ${res}`)
    }
  }

  async deleteUser(account: string, user: string): Promise<boolean> {
    const res = await Exec(`nsc delete user -a ${account} ${user}`)
    console.log('deleteUser res = ', res)
    return Promise.resolve(res.includes('[ OK ] delete users'))
  }

  async handlePermission(permission: IPermission): Promise<boolean> {
    console.log('start handle permission')
    console.log('permission = ', util.inspect(permission, true,null,true))

    const account: string = permission.productSuite
    const users: Array<NatsUser> = permission.users
    
    const oldPermission: IPermission = await TE.match<Error, IPermission, O.Option<Readonly<IPermission>>>(
      () => PermissionOfEmpty(),
      r => {
        return O.match<IPermission, IPermission>(
          () => PermissionOfEmpty(),
          s => s
        )(r)
      }
    )(permissionRepo.getPermissionByProductSuite(account))()

    if (await this.isExistAccount(account) === false) {
      await this.addAccount(account)
      await TE.match<Error, void, O.Option<Readonly<IPermission>>>(
        (e) => console.error(`Save permission error: ${e}`),
        r => console.log('save permission successfully')
      )(permissionRepo.savePermission(permission))()
    }
    //  TODO: finish
    await Promise.all( users.map(async (user) => {
      const oldUserFilter = oldPermission.users.filter(item => item.user === user.user)
      user.publicKey = oldUserFilter.length === 1 ? oldUserFilter[0].publicKey : ''
      user.credsFile = oldUserFilter.length === 1 ? oldUserFilter[0].credsFile : ''

      if (user.status === 'Revoke') {
        await this.revokeUser(account, user.user)
        return
      }
      if ((await this.isExistUser(account, user.user)) === false) {
        // add User will get new publicKey and credsFile
        const {publicKey, credsFile} = await this.addUser(account, user.user, user.permissions.subscribes)
        user.publicKey = publicKey
        user.credsFile = credsFile
        // console.log(user.publicKey, user.credsFile)
        return
      } else {
        //   if user in revoke
        const revocations = await this.getRevocationsList(account)
        if (revocations.includes(user.publicKey)) {
          // active user
          await this.activeUser(account, user.user)
        } else {
          // edit user
          const oldSubs = await this.getUserSubs(account, user.user)
          const newSubs = user.permissions.subscribes
          const rmSubs = oldSubs.filter(x => !newSubs.includes(x))
          const allowSubs = newSubs.filter(x => !oldSubs.includes(x))
          await this.editUser(account, user.user, allowSubs, rmSubs)
        }
        
      }
    })
    )

    console.log('handle permission')
    console.log('permission = ', util.inspect(permission, true,null,true))

    const result = await TE.match<Error, boolean, O.Option<Readonly<IPermission>>>(
      (e) => false,
      r => {
        return O.match<Readonly<IPermission>, any>(
          () => false,
          p => true
        )(r)
      }
    )(permissionRepo.updatePermission(account, permission))()

    return Promise.resolve(result)
  }
  
}

export { NatsRepoImpl, Exec }
