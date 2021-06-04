import * as TE from 'fp-ts/TaskEither';
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  DownedDockerComposeEnvironment
} from 'testcontainers';
import * as path from 'path';
import { FastifyInstance } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { startFastify } from '../http-server/server';
import { fastifyPortOf } from '../repo/config-repo';

describe('Form', () => {
  let server: FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse
  >;
  let mongoDBPort: number;
  let environment: StartedDockerComposeEnvironment;

  beforeAll(async () => {
    jest.setTimeout(120000);

    server = startFastify(fastifyPortOf(8888));

    const composeFilePath = path.resolve(__dirname, '../..');
    const composeFile = 'docker-compose.yml';

    environment = await new DockerComposeEnvironment(composeFilePath, composeFile).up();

    const mongoDBContainer = environment.getContainer("mongodb_1");

    mongoDBPort = mongoDBContainer.getMappedPort(27017);
  });

  afterAll(async () => {
    await TE.match<Error, void, DownedDockerComposeEnvironment>(
      e => console.log(e.message),
      c => console.log(`container: ${JSON.stringify(c, null, 2)} was stopped successfully`)
    )(TE.tryCatch(
      () => environment.down(),
      e => new Error(`Test container closing error: ${JSON.stringify(e)}`)
    ))();
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