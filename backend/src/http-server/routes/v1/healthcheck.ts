import { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Type, Static } from '@sinclair/typebox';


/**
 * @api {ge t} /v1/health healthcheck API
 * @apiName Healthcare
 * @apiGroup Admin
 * @apiSuccess {String} status health status: `green` means healthy; `yellow` means attention; `red` means unhealthy
 * 
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "status": "green"
 *  }
 * 
 * @apiError (Error 5xx) InternalServerError Server ran into an error
 * @apiErrorExample Error-Response:
 *   HTTP/1.1 500 Internal Server Error
 * 
 * @param server 
 * @param opts 
 * @param done 
 */
const healthcheck = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const HealthcheckResp = Type.Object({ status: Type.String() })
  type HealthcheckResp = Static<typeof HealthcheckResp>

  opts = { ...opts, schema: { response: { 200: HealthcheckResp } } };

  server.get('/health', opts, (_, reply) => {
    reply.code(200).send({ status: 'green' });
  });

  done();
}

export { healthcheck };