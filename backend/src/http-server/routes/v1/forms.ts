import { FastifyInstance, RouteShorthandOptions, FastifyReply } from 'fastify'
import { Type, Static } from '@sinclair/typebox'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { FormRepoImpl } from '../../../repo/form-repo'
import { IForm, Status, FormBody } from '../../../types/form'
import { Types } from 'mongoose'
import { of } from 'fp-ts/Identity'
import { zero } from 'fp-ts/Array'

/**
 * @api {get} /v1/forms acquires all existing forms
 * @apiName Get Forms
 * @apiGroup Form
 * @apiSuccess {Object[]} forms a list of forms
 * @apiSuccess {string} forms.id `UUID` the form ID
 * @apiSuccess {string} forms.apiId `UUID` the registered AsyncAPI ID
 * @apiSuccess {string} forms.subscriberId a data consumer ID, this can be a NATS account's user name,
 * it depends on NATS' account configuration
 * @apiSuccess {string} forms.submitUser the Windows user ID
 * @apiSuccess {string} form.status a form's status, either `pending`, `approved` or `rejected`
 * @apiSuccessExample {json} Success-Response:
 *   HTTP/1.1 200 OK
 *   {
 *      "forms": [
 *        {
 *          "_id": 'e8d10038-c433-11eb-822a-ffc573749d39',
 *          "apiId": '11f88b66-c434-11eb-adaa-67fca24f6e0a',
 *          "subscriberId": 'e574022c-c434-11eb-9d7f-9bd525bab798',
 *          "submitUser": 'ywchuo',
 *          "status": "pending"
 *        },
 *        {
 *          "_id": 'cff7358a-c435-11eb-81b8-97fc188ac045',
 *          "apiId": 'd7ec04b4-c435-11eb-8a89-f3d20a486deb',
 *          "subscriberId": 'e04df19e-c435-11eb-a00e-e7f42023e9e2',
 *          "submitUser": 'hmchangm',
 *          "status": "approved"
 *        }
 *      ]
 *    }
 * @param server - Fastify server instance
 * @param opts - route configuration
 * @param done - a callback when this end point is done
 */

/**
 * @api {post} /v1/forms create a new form
 * @apiName Create Form
 * @apiGroup Form
 * @apiSuccess {string} forms.id `UUID` the form ID
 * @apiSuccess {string} forms.apiId `UUID` the registered AsyncAPI ID
 * @apiSuccess {string} forms.subscriberId a data consumer ID, this can be a NATS account's user name,
 * it depends on NATS' account configuration
 * @apiSuccess {string} forms.submitUser the Windows user ID
 * @apiSuccess {string} form.status a form's status, either `pending`, `approved` or `rejected`
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 201 OK
 *  {
 *    form: {
 *       _id: 'b4692118-90c8-4e81-9f3f-93bbb0190a16'
 *       apiId: '11f88b66-c434-11eb-adaa-67fca24f6e0a',
 *       subscriberId: 'e574022c-c434-11eb-9d7f-9bd525bab798',
 *       submitUser: 'ywchuo',
 *       status: 'pending'
 *     }
 *  }
 * @apiError (Error 5xx) InternalServerError Server ran into an error
 * @apiErrorExample Error-Response:
 *   HTTP/1.1 500 Internal [Server Error]
 */

//  TODO: API doc parameter update (GET /form/:id)
const FormsRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const formRepo: FormRepoImpl = FormRepoImpl.of()

  const Response = {
    forms: Type.Array(
      Type.Object({
        _id: Type.String({ format: 'uuid' }),
        apiId: Type.String({ format: 'uuid' }),
        subscriberId: Type.String(),
        submitUser: Type.String(),
        status: Type.Enum(Status),
        approver: Type.Optional(Type.String()),
        approveDate: Type.Optional(Type.String()),
        comment: Type.Optional(Type.String()),
        createdAt: Type.String(),
        updatedAt: Type.String()
      })
    )
  }

  const SingleResponse = {
    form: Type.Object({
      _id: Type.String({ format: 'uuid' }),
      apiId: Type.String({ format: 'uuid' }),
      subscriberId: Type.String(),
      submitUser: Type.String(),
      status: Type.Enum(Status),
      approver: Type.Optional(Type.String()),
      approveDate: Type.Optional(Type.String()),
      comment: Type.Optional(Type.String()),
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

  // By fastify funcky
  // server.get('/forms', opts, async (request, reply) => {
  //     return await map((forms) => ({ forms }))(FormRepo.getForms())()
  // })

  server.get('/forms', opts, async (request, reply) => {
    await TE.match<Error, FastifyReply, O.Option<Readonly<Array<IForm>>>>(
      (e) => {
        request.log.error(`Get forms fail: ${e}`)

        return reply.status(500).send(ErrOf(500, `[Server Error]: ${e}`))
      },
      (r) => {
        const forms: Readonly<Array<IForm>> = O.match<Readonly<Array<IForm>>, Readonly<Array<IForm>>>(
          () => zero<IForm>(),
          (value) => of(value)
        )(r)

        return reply.code(200).send({ forms })
      }
    )(formRepo.getForms())()
  })

  // By fastify funcky
  // server.post('/forms', opts, async (request, reply) => {
  //     return await map((form) => {
  //         reply.status(201)

  //         return { form }
  // })(FormRepo.addForm(request.body as FormRepo.FormBody))()

  // TODO: reply 422 not implement
  server.post('/forms', opts, async (request, reply) => {
    await TE.match<Error, FastifyReply, IForm>(
      (e) => {
        request.log.error(`Add form fail: ${e}`)
        return reply.status(500).send(ErrOf(500, `[Server Error] ${e}`))
      },
      (form) => reply.status(201).send({ form })
    )(formRepo.addForm(request.body as FormBody))()
  })

  server.get<{ Params: IdParam }>('/form/:id', singleOpts, async (request, reply) => {
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
        await TE.match<Error, FastifyReply, O.Option<Readonly<IForm>>>(
          (e) => {
            return reply.status(500).send(ErrOf(500, `[Server Error]: ${e}`))
          },
          (r) => {
            return O.match<Readonly<IForm>, FastifyReply>(
              () => reply.status(404).send(ErrOf(404, `Not Found`)),
              (form) => reply.status(200).send({ form })
            )(r)
          }
        )(formRepo.getFormById(id))()
    }
  })

  server.put<{ Params: IdParam }>('/form/:id', singleOpts, async (request, reply) => {
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
        await TE.match<Error, FastifyReply, O.Option<Readonly<IForm>>>(
          (e) => {
            return reply.status(500).send(ErrOf(500, `[Server Error]: ${e}`))
          },
          (r) => {
            return O.match<Readonly<IForm>, FastifyReply>(
              () => reply.status(404).send(ErrOf(404, `Not Found`)),
              (form) => reply.status(200).send({ form })
            )(r)
          }
        )(formRepo.updateForm(id, request.body as FormBody))()
    }
  })

  done()
}

export { FormsRouter }
