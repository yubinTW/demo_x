enum Status {
  On = 'on',
  Off = 'off'
}

interface IAapi {
  readonly _id?: string
  title: string
  description: string
  productSuite: string
  product: string
  aapiOwner: string
  subject: string
  doc: string
  doc_json: string
  subscribers: []
  comment: string
  status: Status
  readonly createdAt?: Date
  readonly updatedAt?: Date
}

// json body
type AapiBody = {
  readonly title: string
  readonly description: string
  readonly productSuite: string
  readonly product: string
  readonly aapiOwner: string
  readonly subject: string
  readonly doc: string
  readonly doc_json: string
  readonly subscribers: []
  readonly status: Status
  readonly comment: string
}

// query from Mongo
type MongoAapi = {
  readonly _id?: string
  readonly title: string
  readonly description: string
  readonly productSuite: string
  readonly product: string
  readonly aapiOwner: string
  readonly subject: string
  readonly doc: string
  readonly doc_json: string
  readonly subscribers: []
  readonly comment: string
  readonly status: Status
  readonly createdAt?: Date
  readonly updatedAt?: Date
}

export { Status, IAapi, AapiBody, MongoAapi }
