import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import { zero } from 'fp-ts/Array'
import { IAapi } from '../types/aapi'
import Aapi from '../models/aapi'

interface PermissionRepo {
  getAuthorizedAapisByProductSuite(productSuite: string): Promise<Array<IAapi>>
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
}

export { PermissionRepoImpl, MockPermissionRepoImpl }
