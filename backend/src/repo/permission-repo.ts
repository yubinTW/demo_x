import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import { zero } from 'fp-ts/Array'
import { IAapi } from '../types/aapi'
import Aapi from '../models/aapi'
import { IPermission } from '../types/permission'
import Permission from '../models/permission'
import { pipe } from 'fp-ts/function'

interface PermissionRepo {
  getAuthorizedAapisByProductSuite(productSuite: string): Promise<Array<IAapi>>
  savePermission(permission: IPermission): TE.TaskEither<Error, O.Option<Readonly<IPermission>>>
}

class PermissionRepoImpl implements PermissionRepo {
  private static instance: PermissionRepoImpl
  private constructor() {}

  static of(): PermissionRepoImpl {
    return O.getOrElse(() => new PermissionRepoImpl())(O.fromNullable(PermissionRepoImpl.instance))
  }

  getAuthorizedAapisByProductSuite(productSuite: string): Promise<Array<IAapi>> {
    return Promise.resolve(zero<IAapi>())
  }

  savePermission(permission: IPermission): TE.TaskEither<Error, O.Option<Readonly<IPermission>>> {
    const filter = {
      productSuite: permission.productSuite
    }
    return pipe(
      TE.tryCatch(
        () => Permission.findOneAndUpdate(filter, permission, { new: true, upsert: true }).exec(),
        (e) => new Error(`Create Permission Error: ${e}`)
      ),
      TE.map<any, O.Option<Readonly<IPermission>>>((r) => (r ? O.some(r) : O.none))
    )
  }
}

class MockPermissionRepoImpl implements PermissionRepo {
  private static instance: MockPermissionRepoImpl
  private constructor() {}

  static of(): MockPermissionRepoImpl {
    return O.getOrElse(() => new MockPermissionRepoImpl())(O.fromNullable(MockPermissionRepoImpl.instance))
  }

  async getAuthorizedAapisByProductSuite(productSuite: string): Promise<Array<IAapi>> {
    switch (productSuite) {
      case 'DEP':
        return await Aapi.find({ title: 'aapi01' }).exec()
      default:
        return Promise.resolve(zero<IAapi>())
    }
  }

  savePermission(permission: IPermission): TE.TaskEither<Error, O.Option<Readonly<IPermission>>> {
    const filter = {
      productSuite: permission.productSuite
    }
    return pipe(
      TE.tryCatch(
        () => Permission.findOneAndUpdate(filter, permission, { new: true, upsert: true }).exec(),
        (e) => new Error(`Create Permission Error: ${e}`)
      ),
      TE.map<any, O.Option<Readonly<IPermission>>>((r) => (r ? O.some(r) : O.none))
    )
  }
}

export { PermissionRepoImpl, MockPermissionRepoImpl }
