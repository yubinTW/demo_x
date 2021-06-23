import { FastifyInstance, RouteShorthandOptions, FastifyReply } from 'fastify'
import { Type, Static } from '@sinclair/typebox'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { of } from 'fp-ts/Identity'
import { zero } from 'fp-ts/Array'
import { AapiRepoImpl } from '../../../repo/aapi-repo'
import { Status, EventBody } from '../../../types/aapi'

const MyEventRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const aapiRepo: AapiRepoImpl = AapiRepoImpl.of()

  const Response = {
    event: Type.Object({
      own: Type.Array(
        Type.Object({
          _id: Type.String(),
          title: Type.String(),
          description: Type.String(),
          productSuite: Type.String(),
          product: Type.String(),
          aapiOwner: Type.String(),
          subject: Type.String(),
          doc: Type.Optional(Type.String()),
          doc_json: Type.Optional(Type.String()),
          comment: Type.Optional(Type.String()),
          status: Type.Enum(Status),
          subscribers: Type.Optional(
            Type.Array(
              Type.Object({
                name: Type.String()
              })
            )
          ),
          createdAt: Type.String(),
          updatedAt: Type.String()
        })
      ),
      subscribe: Type.Array(
        Type.Object({
          _id: Type.String(),
          title: Type.String(),
          description: Type.String(),
          productSuite: Type.String(),
          product: Type.String(),
          aapiOwner: Type.String(),
          subject: Type.String(),
          doc: Type.Optional(Type.String()),
          doc_json: Type.Optional(Type.String()),
          comment: Type.Optional(Type.String()),
          status: Type.Enum(Status),
          createdAt: Type.String(),
          updatedAt: Type.String()
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

  opts = { ...opts, schema: { response: { 200: Response } } }

  server.get('/myevent', opts, async (request, reply) => {
    await TE.match<Error, FastifyReply, O.Option<Readonly<EventBody>>>(
      (e) => {
        request.log.error(`Get productSuite fail: ${e}`)

        return reply.status(500).send(ErrOf(500, `[Server Error]: ${e}`))
      },
      (r) => {
        const event: Readonly<EventBody> = O.match<Readonly<EventBody>, Readonly<EventBody>>(
          () => {
            return { own: [], subscribe: [] } as EventBody
          },
          (value) => of(value)
        )(r)

        return reply.code(200).send({ event })
      }
    )(aapiRepo.getMyEvent())()
  })

  done()
}

export { MyEventRouter }
