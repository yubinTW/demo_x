import { startFastify } from './server'
import { EnvConfigRepoImpl, fastifyPortOf } from '../repo/config-repo'
import { getOrElse } from 'fp-ts/Option'

// Start your server
const fastifyPort = getOrElse(() => fastifyPortOf(8080))(EnvConfigRepoImpl.of().fastifyPort())
const server = startFastify(fastifyPort)

export { server }
