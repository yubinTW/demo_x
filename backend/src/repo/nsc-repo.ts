import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import { exec } from 'child_process'
import util from 'util'

interface NscRepo {}

type NatsUserInfo = {
  publicKey: string
  credsFile: string
}

const commandPrefix = 'docker exec -t natsbox'

const Exec = (command: string): Promise<string> => {
  return new Promise<string>((done, failed) => {
    exec(`${commandPrefix} ${command}`, (err, stdout, _) => {
      O.match(
        () => done(stdout),
        (e) => failed(`${e} \n${stdout}`)
      )(O.fromNullable(err))
    })
  })
}

class NscRepoImpl implements NscRepo {
  private static instance: NscRepoImpl
  private constructor() {}

  static of(): NscRepoImpl {
    return O.getOrElse(() => new NscRepoImpl())(O.fromNullable(NscRepoImpl.instance))
  }

  getVersion(): TE.TaskEither<Error, string> {
    return TE.tryCatch<Error, string>(
      () => Exec(`nsc --versionnn`),
      (e) => new Error(`Failed to get nsc version: ${e}`)
    )
  }

  setJwtServerUrl(url: string): TE.TaskEither<Error, string> {
    return TE.tryCatch<Error, string>(
      () => Exec(`nsc edit operator -u ${url}`),
      (e) => new Error(`Failed to set JWT Server: ${e}`)
    )
  }

  setOperator(operator: string): TE.TaskEither<Error, string> {
    return TE.tryCatch<Error, string>(
      () => Exec(`nsc env -o ${operator}`),
      (e) => new Error(`Failed to set operator: ${e}`)
    )
  }

  nscPush(account: string): TE.TaskEither<Error, string> {
    return TE.tryCatch<Error, string>(
      () => Exec(`nsc push -a ${account}`),
      (e) => new Error(`Failed to push: ${e}`)
    )
  }

  nscPull(): TE.TaskEither<Error, string> {
    return TE.tryCatch<Error, string>(
      () => Exec(`nsc pull --all`),
      (e) => new Error(`Failed to pull: ${e}`)
    )
  }

  addAccount(account: string): TE.TaskEither<Error, string> {
    return TE.tryCatch<Error, string>(
      () => Exec(`nsc add account ${account}`),
      (e) => new Error(`Failed to add account: ${e}`)
    )
  }

  isExistAccount(account: string): TE.TaskEither<Error, boolean> {
    return pipe(
      TE.tryCatch<Error, string>(
        () => Exec(`nsc describe account ${account}`),
        (e) => new Error(`Failed to get account: ${e}`)
      ),
      TE.map<string, boolean>((s) => s.includes('Account Details'))
    )
  }

  deleteAccount(account: string): TE.TaskEither<Error, string> {
    return TE.tryCatch<Error, string>(
      () => Exec(`nsc delete account ${account}`),
      (e) => new Error(`Failed to delete account: ${e}`)
    )
  }

  getRevocationsList(account: string): TE.TaskEither<Error, Array<string>> {
    return pipe(
      TE.tryCatch<Error, string>(
        () => Exec(`nsc revocations list-users -a ${account}`),
        (e) => new Error(`Failed to get revocation list: ${e}`)
      ),
      TE.map<string, string[]>((s) => {
        const keys = s.match(/\w{56}/g)
        return keys ? keys : []
      })
    )
  }

  revokeUser(account: string, user: string): TE.TaskEither<Error, boolean> {
    return pipe(
      TE.tryCatch<Error, string>(
        () => Exec(`nsc revocations add-user -a ${account} -n ${user}`),
        (e) => new Error(`Failed to revoke user: ${e}`)
      ),
      TE.map<string, boolean>((s) => s.includes('[ OK ] revoked user'))
    )
  }

  activeUser(account: string, user: string): TE.TaskEither<Error, boolean> {
    return pipe(
      TE.tryCatch<Error, string>(
        () => Exec(`nsc revocations delete-user -a ${account} -n ${user}`),
        (e) => new Error(`Failed to active user: ${e}`)
      ),
      TE.map<string, boolean>((s) => s.includes('[ OK ] deleted user revocation'))
    )
  }

  isExistUser(account: string, user: string): TE.TaskEither<Error, boolean> {
    return pipe(
      TE.tryCatch<Error, string>(
        () => Exec(`nsc describe user -a ${account} -n ${user}`),
        (e) => new Error(`Failed to describe user: ${e}`)
      ),
      TE.map<string, boolean>((s) => s.includes('User ID'))
    )
  }

  getUserSubs(account: string, user: string): TE.TaskEither<Error, Array<string>> {
    return pipe(
      TE.tryCatch(
        () => Exec(`nsc describe user -a ${account} -n ${user} --json`),
        (e) => new Error(`Failed to get user subs: ${e}`)
      ),
      TE.map<string, string[]>((s) => {
        const j = JSON.parse(s)
        return j.nats.sub.allow
      })
    )
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
}

export { NscRepoImpl }
