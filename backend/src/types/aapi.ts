enum Status {
  On = 'on',
  Off = 'off'
}

interface IAapi {
  readonly _id?: string
  name: string
  productSuite: string
  aapiOwner: string
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
  readonly name: string
  readonly productSuite: string
  readonly aapiOwner: string
  readonly doc: string
  readonly doc_json: string
  readonly subscribers: []
  readonly status: Status
  readonly comment: string
}

// query from Mongo
type MongoAapi = {
  readonly _id?: string
  readonly name: string
  readonly productSuite: string
  readonly aapiOwner: string
  readonly doc: string
  readonly doc_json: string
  readonly subscribers: []
  readonly comment: string
  readonly status: Status
  readonly createdAt?: Date
  readonly updatedAt?: Date
}

export { Status, IAapi, AapiBody, MongoAapi }
