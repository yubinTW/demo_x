import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { FastifyCookieOptions } from 'fastify-cookie'
import cookie from 'fastify-cookie'
import { Server, IncomingMessage, ServerResponse, request } from 'http'
import { fromNullable, match, map, getOrElse } from 'fp-ts/Option'
import { FastifyPort, EnvConfigRepoImpl, RuntimeEnv } from '../repo/config-repo'
import { healthcheck } from './routes/v1/healthcheck'
import { AapiRouter } from './routes/v1/aapi'
import { ProductSuiteRouter } from './routes/v1/productSuite'
import { MyEventRouter } from './routes/v1/myevent'
import { PermissionRouter } from './routes/v1/permission'
import { CredentialRouter } from './routes/v1/credential'
import fastifyStatic from 'fastify-static'
import fastifySwagger from 'fastify-swagger'
import path from 'path'
import { establishConnection } from '../plugins/mongodb'
import { fastifyFunky } from 'fastify-funky'
import * as O from 'fp-ts/Option'

/* tslint:disable:no-console */
const shouldPrettyPrint = getOrElse(() => false)(
  map<RuntimeEnv, boolean>((e) => e.env === 'dev')(EnvConfigRepoImpl.of().runtimeEnv())
)
const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
  logger: { prettyPrint: shouldPrettyPrint }
})

server.register(cookie, {
  secret: '', // for cookies signature
  parseOptions: {} // options for parsing cookies
} as FastifyCookieOptions)

/**
 * Start a Fastify server
 *
 * @param port - HTTP/s port for this Fastify server
 * @returns a Fastify server instance
 */
const startFastify: (port: FastifyPort) => FastifyInstance<Server, IncomingMessage, ServerResponse> = (port) => {
  server.listen(port, (err, _) => {
    O.match<Error, void>(
      () => establishConnection(),
      (e) => console.error(e)
    )(fromNullable(err))
  })

  enum IsError {
    Error,
    NonError
  }
  const isError: (statusCode: number) => IsError = (statusCode) =>
    statusCode >= 400 ? IsError.Error : IsError.NonError

  server.addHook('onSend', (request, reply, payload, next) => {
    switch (isError(reply.statusCode)) {
      case IsError.Error:
        const msg = `Error code ${reply.statusCode} on ${request.method} ${
          request.routerPath
        }, request params: ${JSON.stringify(request.params)}, request payload: ${JSON.stringify(
          request.body
        )}, reply payload: ${payload}`

        request.log.error(msg)
      case IsError.NonError:
      default:
    }
    next()
  })

  /* auth user by a4 token before User Handler */
  server.addHook('preHandler', (request: FastifyRequest, reply: FastifyReply, done) => {
    // TODO: implement by KeyCloak

    done()
  })

  server.register(fastifyFunky)
  server.register(fastifyStatic, {
    root: path.join(__dirname, '../../../frontend/build'),
    prefix: '/'
  })
  server.register(fastifySwagger, {
    mode: 'static',
    routePrefix: '/documentation',
    exposeRoute: true,
    specification: {
      path: 'docs/product-x.yaml',
      postProcessor: (_) => _,
      baseDir: ''
    }
  })

  server.register(healthcheck, { prefix: '/v1' })
  server.register(AapiRouter, { prefix: '/v1' })
  server.register(ProductSuiteRouter, { prefix: '/v1' })
  server.register(MyEventRouter, { prefix: '/v1' })
  server.register(PermissionRouter, { prefix: '/v1' })
  server.register(CredentialRouter, { prefix: '/v1' })

  return server
}

export { startFastify }
