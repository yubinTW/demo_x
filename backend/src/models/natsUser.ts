import mongoose from 'mongoose'
import { INatsUser } from '../types/natsUser'

const userSchema = new mongoose.Schema(
  {
    account: { type: String, required: true },
    user: { type: String, required: true },
    status: { type: String, required: true },
    productSuite: { type: String, required: true },
    product: { type: String },
    permissions: {
      subscribes: { type: Array }
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<INatsUser>('NatsUser', userSchema)
