import Form from '../modules/forms/entity';

export const createForm = async (data: any) => {
    try {
        return await Form.create(data);
    } catch (err) {
        throw err;
    }
};