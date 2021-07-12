import { MockA4RepoImpl } from '../repo/a4-repo'
import { zero } from 'fp-ts/Array'
import * as O from 'fp-ts/Option'

describe('A4 repository', () => {
  it('should acquire is vaild account', () => {
    const a4Repo = MockA4RepoImpl.of()

    expect(a4Repo.isValidAccount('account01')).toStrictEqual(true)
    expect(a4Repo.isValidAccount('account03')).toStrictEqual(false)
  })

  it("should acquire account's roles", () => {
    const a4Repo = MockA4RepoImpl.of()
    expect(a4Repo.getRolesByAccount('account01')[0]).toStrictEqual('IT/DEPT/SEC01 Ops')
    expect(a4Repo.getRolesByAccount('account01')[1]).toStrictEqual('IT/DEPT/SEC01 Dev')
    expect(a4Repo.getRolesByAccount('account03')).toStrictEqual(zero())
  })

  it("should return login account's name", () => {
    const a4Repo = MockA4RepoImpl.of()
    a4Repo.setLoginAccount('JWLINV')
    expect(a4Repo.getLoginAccount()).toStrictEqual('JWLINV')
  })

  it('return productSuite owned by this accountName', () => {
    const a4Repo = MockA4RepoImpl.of()
    const productSuite = O.match<string, string>(
      () => '',
      (ps) => ps
    )(a4Repo.getOwnedProductSuiteByAccount('JWLINV'))
    expect(productSuite).toStrictEqual('NTAP')
  })

  it('should return a productSuite which contain this accountName ', () => {
    const a4Repo = MockA4RepoImpl.of()
    expect(a4Repo.getProductSuiteByAccount('JWLINV')).toStrictEqual(['NTAP'])
  })
})
