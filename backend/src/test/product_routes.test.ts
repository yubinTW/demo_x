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

describe('Product CRUD', () => {
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

	test('Add Product POST /product', async (done) => {
		const response = await server.inject({
			method: 'POST',
			url: '/product',
			payload: {
				_id: '5f2678dff22e1f4a3c0782ee',
				name: 'JBL Headphone',
				category: 'Electronic appliances',
				unit: 1
			}
		});
		expect(response.statusCode).toBe(201);
		done();
	});

	test('Get All Product /product', async (done) => {
		const response = await server.inject({
			method: 'GET',
			url: '/product'
		});
		expect(response.statusCode).toBe(200);
		done();
	});

	test('Update Product PUT /product/:id', async (done) => {
		const response = await server.inject({
			method: 'PUT',
			url: '/product/5f2678dff22e1f4a3c0782ee',
			payload: {
				unit: 2
			}
		});
		expect(response.statusCode).toBe(200);
		done();
	});

	test('Get one Product GET /product/:id', async (done) => {
		const response = await server.inject({
			method: 'GET',
			url: '/product/5f2678dff22e1f4a3c0782ee'
		});
		expect(response.statusCode).toBe(200);
		done();
	});

	test('Delete one Product DELETE /product/:_id', async (done) => {
		const response = await server.inject({
			method: 'DELETE',
			url: '/product/5f2678dff22e1f4a3c0782ee'
		});
		expect(response.statusCode).toBe(200);
		done();
	});
});