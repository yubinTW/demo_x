import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import NatsUser from '../models/natsUser'
import { INatsUser } from '../types/natsUser'
import { pipe } from 'fp-ts/function'

interface AapiRepo {
  getNatsUsers(account: string): TE.TaskEither<Error, O.Option<Readonly<Array<INatsUser>>>>
  addNatsUser(body: INatsUser): TE.TaskEither<Error, Readonly<INatsUser>>
  getNatsUser(account: string, user: string): TE.TaskEither<Error, O.Option<Readonly<INatsUser>>>
  updateNatsUser(body: INatsUser): TE.TaskEither<Error, O.Option<Readonly<INatsUser>>>
  deleteNatsUser(account: string, user: string): TE.TaskEither<Error, O.Option<Readonly<INatsUser>>>
}

class NatsUserRepoImpl implements AapiRepo {
  private static instance: NatsUserRepoImpl
  private constructor() {}

  static of(): NatsUserRepoImpl {
    return O.getOrElse(() => new NatsUserRepoImpl())(O.fromNullable(NatsUserRepoImpl.instance))
  }

  getNatsUsers(account: string): TE.TaskEither<Error, O.Option<Readonly<Array<INatsUser>>>> {
    return TE.map<any, O.Option<Readonly<Array<INatsUser>>>>((f) => (f instanceof Array ? O.some(f) : O.none))(
      TE.tryCatch(
        () => NatsUser.find({ account }).exec(),
        (e) => new Error(`Failed to get NatsUser: ${e}`)
      )
    )
  }

  addNatsUser: (body: INatsUser) => TE.TaskEither<Error, Readonly<INatsUser>> = (body) => {
    return TE.tryCatch(
      () => NatsUser.create(body),
      (e) => new Error(`Failed to create a NatsUser: ${e}`)
    )
  }

  getNatsUser(account: string, user: string): TE.TaskEither<Error, O.Option<Readonly<INatsUser>>> {
    return TE.map<any, O.Option<Readonly<INatsUser>>>((f) => (f ? O.some(f) : O.none))(
      TE.tryCatch(
        () =>
          NatsUser.findOne({
            account,
            user
          }).exec(),
        (e) => new Error(`Failed to get NatsUser by account and username : ${e}`)
      )
    )
  }

  updateNatsUser(body: INatsUser): TE.TaskEither<Error, O.Option<Readonly<INatsUser>>> {
    return TE.map<any, O.Option<Readonly<INatsUser>>>((f) => (f ? O.some(f) : O.none))(
      TE.tryCatch(
        () => NatsUser.findOneAndUpdate({ account: body.account, user: body.user }, body, { new: true }).exec(),
        (e) => new Error(`Failed to update NatsUser: ${e}`)
      )
    )
  }

  deleteNatsUser(account: string, user: string): TE.TaskEither<Error, O.Option<Readonly<INatsUser>>> {
    return pipe(
      TE.tryCatch(
        () => NatsUser.findOneAndDelete({ account, user }).exec(),
        (e) => new Error(`Failed to delete NatsUser: ${e}`)
      ),
      TE.map((f) => (f ? O.some(f) : O.none))
    )
  }

  getCredFile(account: string, user: string): TE.TaskEither<Error, string> {
    return pipe(
      this.getNatsUser(account, user),
      TE.map<O.Option<Readonly<INatsUser>>, string>((r) =>
        pipe(
          r,
          O.map<Readonly<INatsUser>, string>((s) => (s.credsFile ? s.credsFile : '')),
          O.match(
            () => '',
            (s) => s
          )
        )
      )
    )
  }
}

export { NatsUserRepoImpl }
