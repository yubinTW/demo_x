import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import Form from '../models/form'
import { IForm, FormBody, MongoForm, Status } from '../types/form'

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

const mongoForm2IForm: (mf: MongoForm) => IForm = (mf) => ({
  _id: mf._id,
  apiId: mf.apiId,
  subscriberId: mf.subscriberId,
  submitUser: mf.submitUser,
  status: str2Status(mf.status),
  approver: mf.approver,
  approveDate: mf.approveDate,
  comment: mf.comment
})

const formOf: (reqBody: any) => Readonly<IForm> = (reqBody) => ({
  apiId: reqBody.apiId,
  subscriberId: reqBody.subscriberId,
  submitUser: reqBody.submitUser,
  status: str2Status(reqBody.status),
  approver: reqBody.approver,
  approveDate: reqBody.approveDate,
  comment: reqBody.comment
})

interface FormRepo {
  getForms(): TE.TaskEither<Error, O.Option<Readonly<Array<IForm>>>>
  addForm(body: IForm): TE.TaskEither<Error, Readonly<IForm>>
  getFormById(id: string): TE.TaskEither<Error, O.Option<Readonly<IForm>>>
  updateForm(id: string, body: IForm): TE.TaskEither<Error, O.Option<Readonly<IForm>>>
}

class FormRepoImpl implements FormRepo {
  private static instance: FormRepoImpl
  private constructor() {}

  static of(): FormRepoImpl {
    return O.getOrElse(() => new FormRepoImpl())(O.fromNullable(FormRepoImpl.instance))
  }

  /**
   * getForms :: () -> TaskEither Error Array IForm
   */
  getForms(): TE.TaskEither<Error, O.Option<Readonly<Array<IForm>>>> {
    return TE.map<any, O.Option<Readonly<Array<IForm>>>>((f) => (f instanceof Array ? O.some(f) : O.none))(
      TE.tryCatch(
        () => Form.find().exec(),
        (e) => new Error(`Failed to get forms: ${e}`)
      )
    )
  }

  /**
   * addForm :: FormBody -> TaskEither Error Form
   * Insert an API form to the datastore
   * @param body - the API form content
   * @returns either an error or a persisted API form
   */
  addForm: (body: FormBody) => TE.TaskEither<Error, Readonly<IForm>> = (formBody) => {
    return TE.tryCatch(
      () => Form.create(formBody),
      (e) => new Error(`Failed to create an API form: ${e}`)
    )
  }

  // Option IFom :: None | Some IForm
  // https://gcanti.github.io/fp-ts/modules/Option.ts.html
  getFormById(id: string): TE.TaskEither<Error, O.Option<Readonly<IForm>>> {
    return TE.map<any, O.Option<Readonly<IForm>>>((f) => (f ? O.some(f) : O.none))(
      TE.tryCatch(
        () => Form.findById(id).exec(),
        (e) => new Error(`Failed to get form by id : ${e}`)
      )
    )
  }

  updateForm(id: string, body: FormBody): TE.TaskEither<Error, O.Option<Readonly<IForm>>> {
    return TE.map<any, O.Option<Readonly<IForm>>>((f) => (f ? O.some(f) : O.none))(
      TE.tryCatch(
        () => Form.findByIdAndUpdate(id, body, { new: true }).exec(),
        (e) => new Error(`Failed to get form by id : ${e}`)
      )
    )
  }
}

export { FormRepoImpl, formOf }
