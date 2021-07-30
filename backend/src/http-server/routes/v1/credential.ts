import { FastifyInstance, RouteShorthandOptions, FastifyReply } from 'fastify'
import { Type, Static } from '@sinclair/typebox'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { of } from 'fp-ts/Identity'
import { zero } from 'fp-ts/Array'
import { NatsUserRepoImpl } from '../../../repo/natsUser-repo'
import { pipe } from 'fp-ts/function'
import { INatsUser } from '../../../types/natsUser'
import { EnvConfigRepoImpl, credentialFileRootOf } from '../../../repo/config-repo'

const CredentialRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  type CredentialParam = {
    productSuite: string
    user: string
  }

  type Err = {
    code: number
    msg: string
  }

  const ErrOf: (code: number, msg: string) => Err = (code, msg) => ({
    code: code,
    msg: msg
  })

  const credentialFileRoot = O.getOrElse(() => credentialFileRootOf(''))(EnvConfigRepoImpl.of().credentialFileRoot())

  // TODO: 要先確認 user 有權限拿到該 credential file
  server.get<{ Params: CredentialParam }>('/credential/:productSuite/:user', opts, async (request, reply) => {
    const natsUserRepo: NatsUserRepoImpl = NatsUserRepoImpl.of()
    const account = request.params.productSuite
    const user = request.params.user

    const natsUser = await pipe(
      natsUserRepo.getNatsUser(account, user),
      TE.match<Error, O.Option<Readonly<INatsUser>>, O.Option<Readonly<INatsUser>>>(
        () => O.none,
        (r) => r
      )
    )()

    if (O.isNone(natsUser)) {
      return reply.status(404).send(ErrOf(404, 'user not found'))
    }

    const credFile = await pipe(
      natsUserRepo.getCredFile(account, user),
      TE.match<Error, string, string>(
        () => '',
        (r) => r
      )
    )()

    if (credFile !== '') {
      const filename = credFile.split('/')[credFile.split('/').length - 1]
      return reply
        .status(200)
        .header('Content-Disposition', `attachment; filename="${filename}"`)
        .sendFile(credFile, credentialFileRoot.root)
    } else {
      return reply.status(500).send(ErrOf(500, `CredFile is not found`))
    }
  })

  done()
}

export { CredentialRouter }
