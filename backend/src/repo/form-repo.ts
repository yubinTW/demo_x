import { FastifyInstance, RouteShorthandOptions, FastifyReply, FastifyRequest } from 'fastify';
import Form from '../models/form'

enum Status {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected'
};

const getForms = ():any[] => {
    return [
        {
            id: 'e8d10038-c433-11eb-822a-ffc573749d39',
            apiId: '11f88b66-c434-11eb-adaa-67fca24f6e0a',
            subscriberId: 'e574022c-c434-11eb-9d7f-9bd525bab798',
            submitUser: 'ywchuo',
            status: Status.Pending
        },
        {
            id: 'cff7358a-c435-11eb-81b8-97fc188ac045',
            apiId: 'd7ec04b4-c435-11eb-8a89-f3d20a486deb',
            subscriberId: 'e04df19e-c435-11eb-a00e-e7f42023e9e2',
            submitUser: 'hmchangm',
            status: Status.Approved
        }
    ]
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