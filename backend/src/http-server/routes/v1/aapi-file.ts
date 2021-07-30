import { FastifyInstance, RouteShorthandOptions, FastifyReply } from 'fastify'
import { Type, Static } from '@sinclair/typebox'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { of } from 'fp-ts/Identity'
import { zero } from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import { AapiRepoImpl } from '../../../repo/aapi-repo'
import { IPermission } from '../../../types/permission'
import { IAapi, AapiBody, Status } from '../../../types/aapi'
import fs from 'fs'
import util from 'util'
import { pipeline, Readable } from 'stream'
import path from 'path'
import { chunk } from 'lodash'

const AapiFileRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const aapiRepo: AapiRepoImpl = AapiRepoImpl.of()

  const Response = {
    aapi: Type.Object({
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
  server.post('/aapi-file', opts, async (request, reply) => {
    const data = await request.file()
    const buf = await data.toBuffer()
    const yaml = require('js-yaml')
    const doc_str = buf.toString()
    const doc = await yaml.load(doc_str)
    const json_doc = JSON.stringify(doc)
    const json_obj = JSON.parse(json_doc)
    const title = json_obj.info.title
    const description = json_obj.info.description
    const aapiOwner = json_obj.info.contact.name
    const subject = Object.keys(json_obj.channels)[0]
    const productSuite = subject.split('.')[0]
    const product = subject.split('.')[1]

    const newaapi: AapiBody = {
      title,
      description,
      productSuite,
      product,
      aapiOwner,
      subject,
      doc: doc_str,
      doc_json: json_doc,
      status: Status.On,
      subscribers: [],
      comment: ''
    }

    await TE.match<Error, FastifyReply, IAapi>(
      (e) => {
        request.log.error(`Add API file fail: ${e}`)
        return reply.status(500).send(ErrOf(500, `[Server Error] ${e}`))
      },
      (aapi) => reply.status(201).send({ aapi })
    )(aapiRepo.addAapi(newaapi))()

    //return reply.status(201).send({})
  })

  done()
}

export { AapiFileRouter }
