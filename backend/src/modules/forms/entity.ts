import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const formSchema = new Schema({
    id: { type: String, required: true },
    apiId: { type: String, required: true },
    subscriberId: { type: String, required: true },
    submitUser: { type: String, required: true },
    status: { type: String, required: true }
});

export default mongoose.model('Form', formSchema);