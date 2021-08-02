import { EnvConfigRepoImpl, mongoDBUrlOf, fastifyPortOf, runtimeEnvOf } from '../repo/config-repo'
import { some } from 'fp-ts/Option'

/***
 *
 * @group ci
 */
describe('Config repository', () => {
  it('should acquire MongoDB URL', () => {
    const configRepo = EnvConfigRepoImpl.of()

    expect(configRepo.mongoDBUrl()).toStrictEqual(some(mongoDBUrlOf('mongodb://localhost:27017')))
    expect(configRepo.fastifyPort()).toStrictEqual(some(fastifyPortOf(8888)))
    expect(configRepo.runtimeEnv()).toStrictEqual(some(runtimeEnvOf('dev')))
    expect(configRepo.runtimeEnv()).not.toStrictEqual(some(runtimeEnvOf('production')))
  })
})
