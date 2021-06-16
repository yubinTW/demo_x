import { FastifyInstance, RouteShorthandOptions, FastifyReply } from 'fastify'
import { Type, Static } from '@sinclair/typebox'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { of } from 'fp-ts/Identity'
import { zero } from 'fp-ts/Array'
import { Types } from 'mongoose'
import { AapiRepoImpl } from '../../../repo/aapi-repo'
import { Status, IAapi, AapiBody } from '../../../types/aapi'

const AapiRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const aapiRepo: AapiRepoImpl = AapiRepoImpl.of()

  const Response = {
    aapis: Type.Array(
      Type.Object({
        _id: Type.String(),
        name: Type.String(),
        productSuite: Type.String(),
        aapiOwner: Type.String(),
        doc: Type.Optional(Type.String()),
        doc_json: Type.Optional(Type.String()),
        comment: Type.Optional(Type.String()),
        status: Type.Enum(Status),
        subscribers: Type.Optional(
          Type.Array(
            Type.Object({
              subscriber: Type.String()
            })
          )
        ),
        createdAt: Type.String(),
        updatedAt: Type.String()
      })
    )
  }

  const SingleResponse = {
    aapi: Type.Object({
      _id: Type.String(),
      name: Type.String(),
      productSuite: Type.String(),
      aapiOwner: Type.String(),
      doc: Type.Optional(Type.String()),
      doc_json: Type.Optional(Type.String()),
      comment: Type.Optional(Type.String()),
      status: Type.Enum(Status),
      subscribers: Type.Optional(
        Type.Array(
          Type.Object({
            subscriber: Type.String()
          })
        )
      ),
      createdAt: Type.String(),
      updatedAt: Type.String()
    })
  }

  type Response = Static<typeof Response>
  type SingleResponse = Static<typeof SingleResponse>

  type Err = {
    code: number
    msg: string
  }

  const ErrOf: (code: number, msg: string) => Err = (code, msg) => ({
    code: code,
    msg: msg
  })

  interface IdParam {
    id: string
  }

  const singleOpts = { ...opts, schema: { response: { 200: SingleResponse } } }
  opts = { ...opts, schema: { response: { 200: Response } } }

  server.get('/aapis', opts, async (request, reply) => {
    await TE.match<Error, FastifyReply, O.Option<Readonly<Array<IAapi>>>>(
      (e) => {
        request.log.error(`Get aapis fail: ${e}`)

        return reply.status(500).send(ErrOf(500, `[Server Error]: ${e}`))
      },
      (r) => {
        const aapis: Readonly<Array<IAapi>> = O.match<Readonly<Array<IAapi>>, Readonly<Array<IAapi>>>(
          () => zero<IAapi>(),
          (value) => of(value)
        )(r)

        return reply.code(200).send({ aapis })
      }
    )(aapiRepo.getAapis())()
  })

  // TODO: reply 422 not implement
  server.post('/aapi', opts, async (request, reply) => {
    await TE.match<Error, FastifyReply, IAapi>(
      (e) => {
        request.log.error(`Add aapi fail: ${e}`)
        return reply.status(500).send(ErrOf(500, `[Server Error] ${e}`))
      },
      (aapi) => reply.status(201).send({ aapi })
    )(aapiRepo.addAapi(request.body as AapiBody))()
  })

  server.get<{ Params: IdParam }>('/aapi/:id', singleOpts, async (request, reply) => {
    const id = request.params.id

    enum IsIdValid {
      Valid,
      Invalid
    }

    const isIdValid: (id: string) => boolean = (id) => {
      return Types.ObjectId.isValid(id)
    }
    const bool2IsIdValid: (b: boolean) => IsIdValid = (b) => (b ? IsIdValid.Valid : IsIdValid.Invalid)

    switch (bool2IsIdValid(isIdValid(id))) {
      case IsIdValid.Invalid:
        return reply.status(400).send(ErrOf(400, `Bad Request`))
      case IsIdValid.Valid:
        await TE.match<Error, FastifyReply, O.Option<Readonly<IAapi>>>(
          (e) => {
            return reply.status(500).send(ErrOf(500, `[Server Error]: ${e}`))
          },
          (r) => {
            return O.match<Readonly<IAapi>, FastifyReply>(
              () => reply.status(404).send(ErrOf(404, `Not Found`)),
              (aapi) => reply.status(200).send({ aapi })
            )(r)
          }
        )(aapiRepo.getAapiById(id))()
    }
  })

  server.put<{ Params: IdParam }>('/aapi/:id', singleOpts, async (request, reply) => {
    const id = request.params.id

    enum IsIdValid {
      Valid,
      Invalid
    }

    const isIdValid: (id: string) => boolean = (id) => {
      return Types.ObjectId.isValid(id)
    }
    const bool2IsIdValid: (b: boolean) => IsIdValid = (b) => (b ? IsIdValid.Valid : IsIdValid.Invalid)

    switch (bool2IsIdValid(isIdValid(id))) {
      case IsIdValid.Invalid:
        return reply.status(400).send(ErrOf(400, `Bad Request`))
      case IsIdValid.Valid:
        await TE.match<Error, FastifyReply, O.Option<Readonly<IAapi>>>(
          (e) => {
            return reply.status(500).send(ErrOf(500, `[Server Error]: ${e}`))
          },
          (r) => {
            return O.match<Readonly<IAapi>, FastifyReply>(
              () => reply.status(404).send(ErrOf(404, `Not Found`)),
              (aapi) => reply.status(200).send({ aapi })
            )(r)
          }
        )(aapiRepo.updateAapi(id, request.body as AapiBody))()
    }
  })

  done()
}

export { AapiRouter }
