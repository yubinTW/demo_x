import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Type, Static } from '@sinclair/typebox';

// TODO - should finish the API doc
// TODO - pagination?

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
 *          "id": 'e8d10038-c433-11eb-822a-ffc573749d39',
 *          "apiId": '11f88b66-c434-11eb-adaa-67fca24f6e0a',
 *          "subscriberId": 'e574022c-c434-11eb-9d7f-9bd525bab798',
 *          "submitUser": 'ywchuo',
 *          "status": "pending"
 *        },
 *        {
 *          "id": 'cff7358a-c435-11eb-81b8-97fc188ac045',
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
 * @parm done - a callback when this end point is done
 */
const getForms = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  enum Status {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected'
  };

  const Response =
  {
    forms: Type.Array(
      Type.Object(
        {
          id: Type.String({ format: 'uuid' }),
          apiId: Type.String({ format: 'uuid' }),
          subscriberId: Type.String(),
          submitUser: Type.String(),
          status: Type.Enum(Status)
        }
      )
    )
  };

  type Response = Static<typeof Response>;

  opts = { ...opts, schema: { response: { 200: Response } } };

  server.get('/forms', opts, (_, reply) => {
    reply.code(200).send(
      {
        forms: [
          {
            id: 'e8d10038-c433-11eb-822a-ffc573749d39',
            apiId: '11f88b66-c434-11eb-adaa-67fca24f6e0a',
            subscriberId: 'e574022c-c434-11eb-9d7f-9bd525bab798',
            submitUser: 'ywchuo',
            status: Status.Pending
          },
          {
            id: 'cff7358a-c435-11eb-81b8-97fc188ac045',
            apiId: 'd7ec04b4-c435-11eb-8a89-f3d20a486deb',
            subscriberId: 'e04df19e-c435-11eb-a00e-e7f42023e9e2',
            submitUser: 'hmchangm',
            status: Status.Approved
          }
        ]
      }
    );
  });

  done();

};

export { getForms };