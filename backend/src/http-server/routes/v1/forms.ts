import { FastifyInstance, RouteShorthandOptions, FastifyReply, FastifyRequest } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import { FormRepoImpl, formOf } from '../../../repo/form-repo';
import { TaskEither, right, map, chain, mapLeft, bind, bindTo, tryCatch, getOrElse } from 'fp-ts/TaskEither';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { Option, match, some, ap, toNullable, fromNullable } from 'fp-ts/Option';
import { IForm, Status } from '../../../types/form';

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

    type Response = Static<typeof Response>;

    opts = { ...opts, schema: { response: { 200: Response } } };

    server.get('/forms', opts, async (_, reply) => {
        let forms: Readonly<Array<IForm>> = [];
        await pipe(
            bindTo('getForms')(formRepo.getForms()),
            map(({ getForms }) => pipe(
                some((a: Readonly<Array<IForm>>) => {
                    forms = a
                }),
                ap(getForms)
            ))
        )();
        reply.code(200).send(
            {
                forms: forms
            }
        );
    });

    // TODO: add another Response Schema for 201
    server.post('/forms', opts, async (request, reply) => {
        let form: Readonly<IForm> | null = null;
        const formBody = formOf(request.body);
        await pipe(
            () => formRepo.addForm(formBody)(),
            TE.map( f => {
                form = f
            })
        )()

        try {
            reply.status(201).send(
                {
                    form: form
                }
            );
        } catch (err) {
            throw err;
        }
    });

    done();
};

export { FormsRouter };
