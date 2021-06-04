import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { fromNullable, match, map, getOrElse } from 'fp-ts/Option';
import { FastifyPort, EnvConfigRepoImpl, RuntimeEnv } from '../repo/config-repo';
import { healthcheck } from './routes/v1/healthcheck';
import { getForms } from './routes/v1/get-forms';
import FastifyStatic from 'fastify-static'
import path from 'path'
import { productsHandler } from '../modules/products/routes';
import { formsHandler } from '../modules/forms/routes';
require('../plugins/mongodb');
const shouldPrettyPrint = getOrElse(() => false)(map<RuntimeEnv, boolean>(e => e.env === 'dev')(EnvConfigRepoImpl.of().runtimeEnv()));
const server: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({ logger: { prettyPrint: shouldPrettyPrint } });

/**
 * Start a Fastify server
 * 
 * @param port - HTTP/s port for this Fastify server
 * @returns a Fastify server instance
 */
const startFastify: (port: FastifyPort) => FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = (port) => {
  server.listen(port, (err, _) => {
    match<Error, void>(
      () => console.log('Yo! I am alive!'),
      e => {
        console.error(e);
        process.exit(0);
      }
    )(fromNullable(err));
  });

  server.register(FastifyStatic, {
    root: path.join(__dirname, '../../../frontend/build'),
    prefix: '/',
  })

  server.register(healthcheck, { prefix: '/v1' });
  server.register(productsHandler, { prefix: '/product' });
  server.register(getForms, { prefix: '/v1' });
  server.register(formsHandler, { prefix: '/v1' });
  return server;
};

export { startFastify }
