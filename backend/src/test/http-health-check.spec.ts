import { server } from '../http-server';

describe('Healthcheck route', () => {
  it(`hello should say 'hello'`, async () => {
    const response = await server.inject({ method: 'GET', url: '/v1/health' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({ status: 'green' }));
  });
});