import { FastifyInstance, RouteShorthandOptions, FastifyReply, FastifyRequest } from 'fastify';
import Form from '../models/form'

enum Status {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected'
};

const getForms = async () => {
    const arr:any[] = [];
    for await (const doc of Form.find()) {
        arr.push(doc);
    }
    return arr;
}


const addForm = async (formBody: any) => {
    try {
        const form = await Form.create(formBody);
        return form;
    } catch (err) {
        throw err;
    }
}


export { getForms, addForm }