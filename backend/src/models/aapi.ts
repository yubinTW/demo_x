import mongoose from 'mongoose'
import { IAapi } from '../types/aapi'

const Schema = mongoose.Schema

const aapiSchema = new Schema(
  {
    name: { type: String, required: true },
    productSuite: { type: String, required: true },
    aapiOwner: { type: String, required: true },
    doc: { type: String, required: true },
    doc_json: { type: String },
    subscribers: { type: Array },
    comment: { type: String },
    status: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IAapi>('Aapi', aapiSchema)
