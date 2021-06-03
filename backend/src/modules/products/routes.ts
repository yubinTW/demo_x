import { listProductsSchema, deleteProductSchema } from './schema';
import { getAllProducts, getOneProduct, createProduct, updateProduct, deleteProduct } from '../../dao/index';
import { FastifyInstance, RouteShorthandOptions } from 'fastify';

const productsHandler = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
	server.get(
		'/',
		{ schema: listProductsSchema },
		async (req, res) => {
			req.log.info('list products from db');
			const products = await getAllProducts();
			res.send(products);
		}
	);

	server.get('/:_id', async (request, reply) => {
		request.log.info('get one products from db');
		const products = await getOneProduct((request.params as any)._id);
		reply.status(200).send(products);
	});

	server.post('/', async (request, reply) => {
		request.log.info('Add products to db');
		const products = await createProduct(request.body);
		reply.status(201).send(products);
	});

	server.put('/:_id', async (request, reply) => {
		request.log.info('Update product to db');
		const products = await updateProduct((request.params as any)._id, request.body);
		reply.status(200).send(products);
	});

	server.delete(
		'/:_id',
		{ schema: deleteProductSchema },
		async (request, reply) => {
			request.log.info(`delete product ${(request.params as any)._id} from db`);
			await deleteProduct((request.params as any)._id);
			reply.code(200).send('OK');
		}
	);

	done();
}

export { productsHandler };