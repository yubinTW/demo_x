import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Type, Static } from '@sinclair/typebox';

/**
 * @api {get} /forms acquires all existing forms (pagination?)
 * @apiName Get Forms
 * 
 * TODO - should finish the API doc
 */
const getForms = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const Response = Type.Array(Type.Object({
    id: Type.String(),
    apiId: Type.String(),
    subscriberId: Type.String(),
    submitUser: Type.String(),
    status: Type.String()
  }));

  type Response = Static<typeof Response>;

  opts = { ...opts, schema: { response: { 200: Response } } };
  
  enum Status {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected'
  };

  server.get('/forms', opts, (_, reply) => {
    reply.code(200).send([
        {
          id: 'e8d10038-c433-11eb-822a-ffc573749d39',
          apiId: '11f88b66-c434-11eb-adaa-67fca24f6e0a',
          subscriberId: 'e574022c-c434-11eb-9d7f-9bd525bab798',
          submitUser: 'ywchuo',
          status: Status.Pending.valueOf()
        },
        {
          id: 'cff7358a-c435-11eb-81b8-97fc188ac045',
          apiId: 'd7ec04b4-c435-11eb-8a89-f3d20a486deb',
          subscriberId: 'e04df19e-c435-11eb-a00e-e7f42023e9e2',
          submitUser: 'hmchangm',
          status: Status.Approved.valueOf()
        }
      ]);
  });

  done();

};

export { getForms };