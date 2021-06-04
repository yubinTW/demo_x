import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Type, Static } from '@sinclair/typebox';

/**
 * @api {get} /forms acquires all existing forms (pagination?)
 * @apiName Get Forms
 * 
 * TODO - should finish the API doc
 */
const postForms = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
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

    server.post('/forms', opts, (_, reply) => {
        reply.code(201).send([
            {
                id: 'e8d10038-c433-11eb-822a-ffc573749d39',
                apiId: '11f88b66-c434-11eb-adaa-67fca24f6e0a',
                subscriberId: 'e574022c-c434-11eb-9d7f-9bd525bab798',
                submitUser: 'ywchuo',
                status: Status.Pending.valueOf()
            }
        ]);
    });
    done();
};

export { postForms };