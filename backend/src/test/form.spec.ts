import { startFastify } from '../http-server/server';
import { fastifyPortOf } from '../repo/config-repo';
import fastify, { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';

describe('Form', () => {
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

  it('should successfully get a list of existing forms', async () => {
    const response = await server.inject({ method: 'GET', url: '/v1/forms' });

    // https://docs.nats.io/nats-server/configuration/securing_nats/accounts
    // TODO - need to discusss subscriberId (NATS: users of an account), talk to Nelson
    // for now use UUID for subscriberId
    // TODO - need to make sure if the submiter ID is Windows account
    // there will be another external serive for decoding the auth token
    // data Status = Pending | Approved | Rejected
    // TODO - should a `form` be removed?
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(
      JSON.stringify([
        {
          id: 'e8d10038-c433-11eb-822a-ffc573749d39',
          apiId: '11f88b66-c434-11eb-adaa-67fca24f6e0a',
          subscriberId: 'e574022c-c434-11eb-9d7f-9bd525bab798',
          submitUser: 'ywchuo',
          status: 'pending'
        },
        {
          id: 'cff7358a-c435-11eb-81b8-97fc188ac045',
          apiId: 'd7ec04b4-c435-11eb-8a89-f3d20a486deb',
          subscriberId: 'e04df19e-c435-11eb-a00e-e7f42023e9e2',
          submitUser: 'hmchangm',
          status: 'approved'
        }
      ])
    )
  });
});                 