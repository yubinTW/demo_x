import mongoose from 'mongoose';
import * as S from '../http-server/index';


describe('Product CRUD', () => {
	let server = S.server;
	beforeAll(async (done) => {
		done();
		await server.ready();
	});

	afterAll(async (done) => {
		server.close();
		await mongoose.connection.close();
		done();
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