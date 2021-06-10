import mongoose from 'mongoose'
import { IForm } from '../types/form'

const Schema = mongoose.Schema

const formSchema = new Schema(
  {
    apiId: { type: String, required: true },
    subscriberId: { type: String, required: true },
    submitUser: { type: String, required: true },
    status: { type: String, required: true },
    approver: { type: String },
    approveDate: { type: Date },
    comment: { type: String }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IForm>('Form', formSchema)
