import fastify, { FastifyInstance } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { fromNullable, match, map, getOrElse } from 'fp-ts/Option'
import { FastifyPort, EnvConfigRepoImpl, RuntimeEnv } from '../repo/config-repo'
import { healthcheck } from './routes/v1/healthcheck'
import { FormsRouter } from './routes/v1/forms'
import FastifyStatic from 'fastify-static'
import path from 'path'
import { establishConnection } from '../plugins/mongodb'
import { fastifyFunky } from 'fastify-funky'

/* tslint:disable:no-console */
const shouldPrettyPrint = getOrElse(() => false)(
  map<RuntimeEnv, boolean>((e) => e.env === 'dev')(EnvConfigRepoImpl.of().runtimeEnv())
)
const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
  logger: { prettyPrint: shouldPrettyPrint }
})

/**
 * Start a Fastify server
 *
 * @param port - HTTP/s port for this Fastify server
 * @returns a Fastify server instance
 */
const startFastify: (port: FastifyPort) => FastifyInstance<Server, IncomingMessage, ServerResponse> = (port) => {
  server.listen(port, (err, _) => {
    match<Error, void>(
      () => establishConnection(),
      (e) => {
        console.error(e)
        process.exit(0)
      }
    )(fromNullable(err))
  })

  server.register(fastifyFunky)
  server.register(FastifyStatic, {
    root: path.join(__dirname, '../../../frontend/build'),
    prefix: '/'
  })

  server.register(healthcheck, { prefix: '/v1' })
  server.register(FormsRouter, { prefix: '/v1' })

  return server
}

export { startFastify }
