import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import Aapi from '../models/aapi'
import { Status, IAapi, AapiBody, MongoAapi } from '../types/aapi'
import { psSummaryItem } from '../types/productSuite'
// const str2Status: (v: string) => Status = (v) => {
//     switch (v.toLowerCase()) {
//       case Status.On:
//         return Status.On
//       case Status.Off:
//         return Status.Off
//       default:
//         return Status.On
//     }
//   }

interface AapiRepo {
  getAapis(): TE.TaskEither<Error, O.Option<Readonly<Array<IAapi>>>>
  addAapi(body: IAapi): TE.TaskEither<Error, Readonly<IAapi>>
  getAapiById(id: string): TE.TaskEither<Error, O.Option<Readonly<IAapi>>>
  updateAapi(id: string, body: IAapi): TE.TaskEither<Error, O.Option<Readonly<IAapi>>>
}

class AapiRepoImpl implements AapiRepo {
  private static instance: AapiRepoImpl
  private constructor() {}

  static of(): AapiRepoImpl {
    return O.getOrElse(() => new AapiRepoImpl())(O.fromNullable(AapiRepoImpl.instance))
  }

  /**
   * getAapis :: () -> TaskEither Error Array IAapi
   */
  getAapis(): TE.TaskEither<Error, O.Option<Readonly<Array<IAapi>>>> {
    return TE.map<any, O.Option<Readonly<Array<IAapi>>>>((f) => (f instanceof Array ? O.some(f) : O.none))(
      TE.tryCatch(
        () => Aapi.find().exec(),
        (e) => new Error(`Failed to get all API: ${e}`)
      )
    )
  }

  /**
   * addAapi :: AapiBody -> TaskEither Error Aapi
   * Insert an Aapi to the datastore
   * @param body - the API request content
   * @returns either an error or a persisted Aapi
   */
  addAapi: (body: AapiBody) => TE.TaskEither<Error, Readonly<IAapi>> = (formBody) => {
    return TE.tryCatch(
      () => Aapi.create(formBody),
      (e) => new Error(`Failed to create an API: ${e}`)
    )
  }

  // Option IAapi :: None | Some IAapi
  // https://gcanti.github.io/fp-ts/modules/Option.ts.html
  getAapiById(id: string): TE.TaskEither<Error, O.Option<Readonly<IAapi>>> {
    return TE.map<any, O.Option<Readonly<IAapi>>>((f) => (f ? O.some(f) : O.none))(
      TE.tryCatch(
        () => Aapi.findById(id).exec(),
        (e) => new Error(`Failed to get aapi by id : ${e}`)
      )
    )
  }

  updateAapi(id: string, body: AapiBody): TE.TaskEither<Error, O.Option<Readonly<IAapi>>> {
    return TE.map<any, O.Option<Readonly<IAapi>>>((f) => (f ? O.some(f) : O.none))(
      TE.tryCatch(
        () => Aapi.findByIdAndUpdate(id, body, { new: true }).exec(),
        (e) => new Error(`Failed to get aapi by id : ${e}`)
      )
    )
  }
  deleteAapiById(id: string): TE.TaskEither<Error, O.Option<Readonly<IAapi>>> {
    return TE.map<any, O.Option<Readonly<IAapi>>>((f) => (f ? O.some(f) : O.none))(
      TE.tryCatch(
        () => Aapi.findByIdAndDelete(id).exec(),
        (e) => new Error(`Failed to delete aapi by id : ${e}`)
      )
    )
  }

  getProductSuiteSummary(): TE.TaskEither<Error, O.Option<Readonly<Array<psSummaryItem>>>> {
    return TE.map<any, O.Option<Readonly<Array<psSummaryItem>>>>((f) => (f instanceof Array ? O.some(f) : O.none))(
      TE.tryCatch(
        () => Aapi.find().exec(),
        (e) => new Error(`Failed to get all API: ${e}`)
      )
    )
  }
}

export { AapiRepoImpl }
