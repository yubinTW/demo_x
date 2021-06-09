import { FastifyInstance, RouteShorthandOptions, FastifyReply, FastifyRequest } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import * as TE from 'fp-ts/TaskEither';
import * as O from 'fp-ts/Option';
import { FormRepoImpl, formOf } from '../../../repo/form-repo';
import { IForm, Status } from '../../../types/form';
import { Types } from 'mongoose'

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
 * 
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
 * 
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 201 OK
 *  {
 *    form: {
        _id: 'b4692118-90c8-4e81-9f3f-93bbb0190a16'
        apiId: '11f88b66-c434-11eb-adaa-67fca24f6e0a',
        subscriberId: 'e574022c-c434-11eb-9d7f-9bd525bab798',
        submitUser: 'ywchuo',
        status: 'pending'
      }
 *  }
 * 
 * @apiError (Error 5xx) InternalServerError Server ran into an error
 * @apiErrorExample Error-Response:
 *   HTTP/1.1 500 Internal Server Error
 * 
 */

//  TODO: API doc parameter update (GET /form/:id)
const FormsRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {

    const formRepo: FormRepoImpl = FormRepoImpl.of();

    const Response =
    {
        forms: Type.Array(
            Type.Object(
                {
                    _id: Type.String({ format: 'uuid' }),
                    apiId: Type.String({ format: 'uuid' }),
                    subscriberId: Type.String(),
                    submitUser: Type.String(),
                    status: Type.Enum(Status),
                    approver: Type.Optional(Type.String()),
                    approveDate: Type.Optional(Type.String()),
                    comment: Type.Optional(Type.String()),
                    createdAt: Type.String(),
                    updatedAt: Type.String(),
                }
            )
        )
    };

    const SingleResponse =
    {
        form:
            Type.Object(
                {
                    _id: Type.String({ format: 'uuid' }),
                    apiId: Type.String({ format: 'uuid' }),
                    subscriberId: Type.String(),
                    submitUser: Type.String(),
                    status: Type.Enum(Status),
                    approver: Type.Optional(Type.String()),
                    approveDate: Type.Optional(Type.String()),
                    comment: Type.Optional(Type.String()),
                    createdAt: Type.String(),
                    updatedAt: Type.String(),
                }
            )

    };

    type Response = Static<typeof Response>;
    type SingleResponse = Static<typeof SingleResponse>;

    let singleOpts = { ...opts, schema: { response: { 200: SingleResponse } } }
    opts = { ...opts, schema: { response: { 200: Response } } };

    server.get('/forms', opts, async (request, reply) => {

        await TE.match<Error, FastifyReply, O.Option<Readonly<Array<IForm>>>>(
            e => {
                request.log.error(`Get forms fail: ${e}`)
                return reply.status(500).send({ msg: `server error: ${e}` })
            },
            r => {
                let forms: Readonly<Array<IForm>> = [];
                O.match<Readonly<Array<IForm>>, void>(
                    () => [],
                    (value) => forms = value
                )(r)
                return reply.code(200).send({ forms })
            }

        )(formRepo.getForms())()

    });

    // TODO: reply 400 not implement 
    server.post('/forms', opts, async (request, reply) => {
        const formBody = formOf(request.body);

        await TE.match<Error, FastifyReply, IForm>(
            e => {
                request.log.error(`Add form fail: ${e}`)
                return reply.status(500).send({ msg: `server error: ${e}` })
            },
            form => reply.status(201).send({ form })
        )(formRepo.addForm(formBody))()

    });

    server.get('/form/:id', singleOpts, async (request, reply) => {
        const id = (request.params as any).id
        if ( !Types.ObjectId.isValid(id) ) {
            return reply.status(400).send({code:400, msg: `Bad Request`});
        }
        await TE.match<Error, FastifyReply, IForm | null>(
            e => {
                return reply.status(500).send({ code:500, msg: `Server Error: ${e}` })
            },
            (form) => {
                if (form == null) {
                    return reply.status(404).send({ code:404, msg: 'Not Found' })
                }
                return reply.status(200).send({ form })
            }
        )(formRepo.getFormById(id))()
    })

    done()

};

export { FormsRouter };
