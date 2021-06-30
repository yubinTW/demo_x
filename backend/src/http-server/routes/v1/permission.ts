import { FastifyInstance, RouteShorthandOptions, FastifyReply } from 'fastify'
import { Type, Static } from '@sinclair/typebox'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { of } from 'fp-ts/Identity'
import { zero } from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import { MockPermissionRepoImpl } from '../../../repo/permission-repo'
import { IPermission } from '../../../types/permission'

const PermissionRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const permissionRepo: MockPermissionRepoImpl = MockPermissionRepoImpl.of()

  const Response = {
    permission: Type.Object({
      productSuite: Type.String(),
      users: Type.Array(
        Type.Object({
          user: Type.String(),
          productSuite: Type.String(),
          product: Type.Optional(Type.String()),
          permissions: Type.Object({
            subscribes: Type.Array(Type.String())
          })
        })
      )
    })
  }

  type Response = Static<typeof Response>

  type Err = {
    code: number
    msg: string
  }

  const ErrOf: (code: number, msg: string) => Err = (code, msg) => ({
    code: code,
    msg: msg
  })

  opts = { ...opts, schema: { response: { 201: Response } } }

  server.post('/permission', opts, async (request, reply) => {
    await TE.match<Error, FastifyReply, O.Option<Readonly<IPermission>>>(
      (e) => {
        request.log.error(`Add permission fail: ${e}`)
        return reply.status(500).send(ErrOf(500, `[Server Error] ${e}`))
      },
      (r) => {
        return O.match(
          () => {
            request.log.error(`Add permission fail`)
            return reply.status(500).send(ErrOf(500, `[Server Error]`))
          },
          (permission) => {
            return reply.status(201).send({ permission })
          }
        )(r)
      }
    )(permissionRepo.savePermission(request.body as IPermission))()
  })

  done()
}

export { PermissionRouter }
