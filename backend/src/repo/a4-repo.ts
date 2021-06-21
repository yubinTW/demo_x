import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import { zero } from 'fp-ts/Array'
interface A4Repo {
  isValidAccount(accountName: string): boolean
  getRolesByAccount(accountName: string): Array<string>
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
}

class MockA4RepoImpl implements A4Repo {
  private static instance: MockA4RepoImpl
  private constructor() {}

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
}

export { A4RepoImpl, MockA4RepoImpl }
