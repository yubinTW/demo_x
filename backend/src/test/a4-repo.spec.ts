import { MockA4RepoImpl } from '../repo/a4-repo'
import { zero } from 'fp-ts/Array'

describe('A4 repository', () => {
  it('should acquire is vaild account', () => {
    const A4Repo = MockA4RepoImpl.of()

    expect(A4Repo.isValidAccount('account01')).toStrictEqual(true)
    expect(A4Repo.isValidAccount('account03')).toStrictEqual(false)
  })

  it("should acquire account's roles", () => {
    const A4Repo = MockA4RepoImpl.of()

    expect(A4Repo.getRolesByAccount('account01')[0]).toStrictEqual('IT/DEPT/SEC01 Ops')
    expect(A4Repo.getRolesByAccount('account01')[1]).toStrictEqual('IT/DEPT/SEC01 Dev')
    expect(A4Repo.getRolesByAccount('account03')).toStrictEqual(zero())
  })
})
