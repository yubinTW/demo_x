import { createForm } from '../../dao/index';
import { FastifyInstance, RouteShorthandOptions } from 'fastify';

const formsHandler = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
    server.post('/forms', async (request, reply) => {
        request.log.info('Add forms to db');
        const forms = await createForm(request.body);
        reply.status(201).send(forms);
    });

    done();
}

export { formsHandler };