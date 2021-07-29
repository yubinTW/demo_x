import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import Aapi from '../models/aapi'
import { Status, IAapi, AapiBody, MongoAapi, EventBody } from '../types/aapi'
import { psSummaryItem } from '../types/productSuite'
import { MockA4RepoImpl } from './a4-repo'
import { MockPermissionRepoImpl } from './permission-repo'

interface AapiRepo {
  getAapis(): TE.TaskEither<Error, O.Option<Readonly<Array<IAapi>>>>
  addAapi(body: IAapi): TE.TaskEither<Error, Readonly<IAapi>>
  getAapiById(id: string): TE.TaskEither<Error, O.Option<Readonly<IAapi>>>
  updateAapi(id: string, body: IAapi): TE.TaskEither<Error, O.Option<Readonly<IAapi>>>
}

const a4Repo = MockA4RepoImpl.of()
const permissionRepo = MockPermissionRepoImpl.of()

type psCondition = {
  productSuite: string
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
  addAapi: (body: AapiBody) => TE.TaskEither<Error, Readonly<IAapi>> = (aapiBody) => {
    return TE.tryCatch(
      () => Aapi.create(aapiBody),
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

  getMyEvent(): TE.TaskEither<Error, O.Option<Readonly<EventBody>>> {
    return TE.map<any, O.Option<Readonly<EventBody>>>((f) => (f ? O.some(f) : O.none))(
      TE.tryCatch(
        () => this.getEvent(),
        (e) => new Error(`Failed to get all API: ${e}`)
      )
    )
  }

  // return EventBody according to permissions of the user
  async getEvent(): Promise<EventBody> {
    // TODO: implement method by authorized user.

    // case1: find which aapi's owner is the login user
    const userAccount = a4Repo.getLoginAccount()

    // case2: if user is productSuite owner, show all aapis with that productSuite
    const ownedProductSuite = O.match<string, string>(
      () => '',
      (ps) => ps
    )(a4Repo.getOwnedProductSuiteByAccount(userAccount))
    // const  = await Aapi.find({ productSuite: ownedProductSuite }).exec()

    const ownAapis = await Aapi.find()
      .or([{ aapiOwner: userAccount }, { productSuite: ownedProductSuite }])
      .exec()

    // subscribe
    // Scenario 1: 我是同一個 Product Suite 的 developer
    const psArray = a4Repo.getProductSuiteByAccount(userAccount)

    const productSuiteCondition: Array<psCondition> = []
    psArray.forEach((ps) => {
      productSuiteCondition.push({
        productSuite: ps
      } as psCondition)
    })

    const subscribeAapis: Array<IAapi> = await Aapi.find()
      .or(productSuiteCondition)
      .where('aapiOwner')
      .nin([userAccount])
      .exec()
    // TODO: Scenario 2: 我不是同一個 Product Suite 的 developer, 但是我隸屬於被授權的 Product Suite

    await Promise.all(
      psArray.map(async (ps) => {
        const authorizedAapis: Array<IAapi> = await permissionRepo.getAuthorizedAapisByProductSuite(ps)

        authorizedAapis
          .filter((x) => !subscribeAapis.includes(x))
          .forEach((aapi) => {
            subscribeAapis.push(aapi)
          })
      })
    )

    const sortRuleAapis: (a: IAapi, b: IAapi) => number = (a, b) => a.title.localeCompare(b.title)

    // get user's A4 role
    const result = {
      own: ownAapis.sort(sortRuleAapis),
      subscribe: subscribeAapis.sort(sortRuleAapis)
    }
    return Promise.resolve(result)
  }
}

export { AapiRepoImpl }
