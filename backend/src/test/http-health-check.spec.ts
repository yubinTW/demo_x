import { startFastify } from '../http-server/server';
import { fastifyPortOf } from '../repo/config-repo';
import { server } from '../http-server';
import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

describe('Healthcheck route', () => {
  let server: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
>;

  beforeAll(() => {
    server = startFastify(fastifyPortOf(8888));
  });

  afterAll(async () => {
    // TODO - should try-catch
    await server.close();
  });

  it(`hello should say 'hello'`, async () => {
    const response = await server.inject({ method: 'GET', url: '/v1/health' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({ status: 'green' }));
  });
});