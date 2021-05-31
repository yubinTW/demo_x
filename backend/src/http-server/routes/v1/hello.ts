import { FastifyInstance, RouteShorthandOptions } from 'fastify';

const sayHello = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  server.get('/hello', opts, (request, reply) => {
    reply.code(200).send({ pong: 'it worked!' });
  });

  done();
}

export { sayHello };