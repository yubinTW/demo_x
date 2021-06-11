enum Status {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected'
}

interface IForm {
  readonly _id?: string
  apiId: string
  subscriberId: string
  submitUser: string
  status: Status
  approver: string
  approveDate: Date
  comment: string
  readonly createdAt?: Date
  readonly updatedAt?: Date
}

// json body
type FormBody = {
  readonly apiId: string
  readonly subscriberId: string
  readonly submitUser: string
  readonly status: Status
  readonly approver: string
  readonly approveDate: Date
  readonly comment: string
}

// query from Mongo
type MongoForm = {
  readonly _id: string
  readonly apiId: string
  readonly subscriberId: string
  readonly submitUser: string
  readonly status: string
  readonly approver: string
  readonly approveDate: Date
  readonly comment: string
}

export { Status, IForm, FormBody, MongoForm }
