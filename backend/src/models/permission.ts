import mongoose from 'mongoose'
import { IPermission } from '../types/permission'

const userSchema = new mongoose.Schema({
  account: { type: String, required: true },
  user: { type: String, required: true },
  productSuite: { type: String, required: true },
  product: { type: String },
  status: { type: String },
  permissions: {
    subscribes: { type: Array }
  },
  publicKey: { type: String },
  credsFile: { type: String }
})


export default mongoose.model<IPermission>('Permission', userSchema)
