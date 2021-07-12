import mongoose from 'mongoose'
import { IPermission } from '../types/permission'

const userSchema = new mongoose.Schema({
  user: { type: String, required: true },
  productSuite: { type: String, required: true },
  product: { type: String },
  permissions: {
    subscribes: { type: Array }
  }
})

const permissionSchema = new mongoose.Schema(
  {
    productSuite: { type: String, required: true },
    users: [userSchema]
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IPermission>('Permission', permissionSchema)
