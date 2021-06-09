import { FastifyInstance, RouteShorthandOptions, FastifyReply, FastifyRequest } from 'fastify'
import Form from '../models/form'
import { TaskEither, tryCatch, map } from 'fp-ts/TaskEither'
import * as A from 'fp-ts/Array'

enum Status {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected'
}

type FormBody = {
  readonly apiId: string
  readonly subscriberId: string
  readonly submitUser: string
  readonly status: Status
}

type ResponseForm = {
  readonly _id: string
  readonly apiId: string
  readonly subscriberId: string
  readonly submitUser: string
  readonly status: Status
}

type MongoForm = {
  readonly _id: string
  readonly apiId: string
  readonly subscriberId: string
  readonly submitUser: string
  readonly status: string
}

const responseFormOf: (
  _id: string,
  apiId: string,
  subscriberId: string,
  submitUser: string,
  status: Status
) => Readonly<ResponseForm> = (_id, apiId, subscriberId, submitUser, status) => ({
  _id,
  apiId,
  subscriberId,
  submitUser,
  status
})

const str2Status: (v: string) => Status = (v) => {
  switch (v.toLowerCase()) {
    case Status.Pending:
      return Status.Pending
    case Status.Approved:
      return Status.Approved
    case Status.Rejected:
    default:
      return Status.Rejected
  }
}

const mongoForm2ResponseForm: (mf: MongoForm) => ResponseForm = (mf) => ({
  _id: mf._id,
  apiId: mf.apiId,
  subscriberId: mf.subscriberId,
  submitUser: mf.submitUser,
  status: str2Status(mf.status)
})

/**
 * getForms :: () -> TaskEither Error Array ResponseForm
 */
const getForms: () => TaskEither<Error, Readonly<Array<ResponseForm>>> = () => {
  return map(A.map(mongoForm2ResponseForm))(
    tryCatch(
      () => Form.find(),
      (e) => new Error(`Failed to acquire all API form: ${e}`)
    )
  )

  // const arr: Array<any> = [];
  // for await (const doc of Form.find()) {
  //     arr.push(doc);
  // }
  // return arr;
}

/**
 * addForm :: FormBody -> TaskEither Error Form
 * Insert an API form to the datastore
 * @param body - the API form content
 * @returns either an error or a persisted API form
 */
const addForm: (body: FormBody) => TaskEither<Error, Readonly<ResponseForm>> = (formBody) => {
  return map<MongoForm, ResponseForm>(mongoForm2ResponseForm)(
    tryCatch(
      () => Form.create(formBody),
      (e) => new Error(`Failed to create an API form: ${e}`)
    )
  )
}

export { getForms, addForm, FormBody, ResponseForm as Form }
