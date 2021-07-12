import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import { zero } from 'fp-ts/Array'
interface A4Repo {
  isValidAccount(accountName: string): boolean
  getRolesByAccount(accountName: string): Array<string>
  getLoginAccount(): string
  // return productSuite owned by this accountName
  getOwnedProductSuiteByAccount(accountName: string): O.Option<string>
  // return a productSuite which contain this accountName
  getProductSuiteByAccount(accountName: string): Array<string>
}

class A4RepoImpl implements A4Repo {
  private static instance: A4RepoImpl
  private constructor() {}

  static of(): A4RepoImpl {
    return O.getOrElse(() => new A4RepoImpl())(O.fromNullable(A4RepoImpl.instance))
  }

  isValidAccount(accountName: string): boolean {
    return true
  }

  getRolesByAccount(accountName: string): Array<string> {
    return ['IT/DEPT/SEC Ops', 'IT/DEPT/SEC Dev']
  }

  getLoginAccount(): string {
    return 'MOCK'
  }

  getOwnedProductSuiteByAccount(accountName: string): O.Option<string> {
    return O.fromNullable('MOCK')
  }

  getProductSuiteByAccount(accountName: string): Array<string> {
    return ['MOCK1', 'MOCK2']
  }
}

class MockA4RepoImpl implements A4Repo {
  private static instance: MockA4RepoImpl
  private constructor() {}

  private accountName: string = ''

  static of(): MockA4RepoImpl {
    return O.getOrElse(() => new MockA4RepoImpl())(O.fromNullable(MockA4RepoImpl.instance))
  }

  isValidAccount(accountName: string): boolean {
    switch (accountName) {
      case 'account01':
      case 'account02':
        return true
      default:
        return false
    }
  }

  getRolesByAccount(accountName: string): Array<string> {
    switch (accountName) {
      case 'account01':
        return ['IT/DEPT/SEC01 Ops', 'IT/DEPT/SEC01 Dev']
      case 'account02':
        return ['IT/DEPT/SEC02 Ops', 'IT/DEPT/SEC02 Dev']
      default:
        return zero()
    }
  }

  // only for testing
  setLoginAccount(accountName: string): void {
    this.accountName = accountName
  }

  getLoginAccount(): string {
    let user = O.match<string, string>(
      () => 'JWLINV',
      (a) => a
    )(O.fromNullable(process.env.loginUser)) // set login user from env by testing
    return this.accountName !== '' ? this.accountName : user
  }

  getOwnedProductSuiteByAccount(accountName: string): O.Option<string> {
    switch (accountName) {
      case 'JWLINV':
        return O.fromNullable('NTAP')
      default:
        return O.none
    }
  }

  getProductSuiteByAccount(accountName: string): Array<string> {
    switch (accountName) {
      case 'JWLINV':
        return ['NTAP']
      case 'YBHSU':
        return ['NTAP']
      case 'developer01':
        return ['DEP']
      default:
        return zero()
    }
  }
}

export { A4RepoImpl, MockA4RepoImpl }
