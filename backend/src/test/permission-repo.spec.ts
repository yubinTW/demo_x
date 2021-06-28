import { MockPermissionRepoImpl } from '../repo/permission-repo'
import { zero } from 'fp-ts/Array'
import * as O from 'fp-ts/Option'

describe('permission repository', () => {
  it('should return empty authorized aapis', async () => {
    const permissionRepo = MockPermissionRepoImpl.of()
    const authorizedAapis = await permissionRepo.getAuthorizedAapisByProductSuite('foo')
    expect(authorizedAapis).toStrictEqual([])
  })
})
