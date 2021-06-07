export const formSchema = {
    id: { type: 'string', format: 'uuid' },
    apiId: { type: 'string' },
    subscriberId: { type: 'string' },
    submitUser: { type: 'string' },
    status: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
};