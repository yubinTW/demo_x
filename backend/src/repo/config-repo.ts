import * as dotEnv from 'dotenv';
import { Option, fromNullable, map } from 'fp-ts/Option';
import * as fp from 'lodash/fp';

type MongoDBUrl = { type: 'MONGODB_URL', mongoDBUrl: string };

const mongoDBUrlOf = (url: string): Readonly<MongoDBUrl> => ({
  type: 'MONGODB_URL',
  mongoDBUrl: url
});

type FastifyPort = { type: 'FASTIFY_PORT', port: number };

const fastifyPortOf = (port: number): Readonly<FastifyPort> => ({
  type: 'FASTIFY_PORT',
  port
});

type RuntimeEnv = { type: 'RUNTIME_ENV', env: string };

/**
 * Smart constructor of runtime environment
 * 
 * @param env - the runtime environment
 * @returns the runtime environment, default: `dev`
 */
const runtimeEnvOf = (env: string): Readonly<RuntimeEnv> => ({
  type: 'RUNTIME_ENV',
  env: fp.includes(env, ['dev', 'production']) ? env : 'dev'
});

interface ConfigRepo {
  /**
   * @return an `Option<MongoDBUrl>`, if the env variable `MONGODB_URL` is defined,
   * returns Some<MongoDBUrl>; otherwise none
   */
  mongoDBUrl(): Option<Readonly<MongoDBUrl>>;

  /**
   * @returns Fastify's port. Some<number> if port is defined; otherwise none
   */
  fastifyPort(): Option<Readonly<FastifyPort>>;

  runtimeEnv(): Option<Readonly<RuntimeEnv>>;
}

class EnvConfigRepoImpl implements ConfigRepo {
  static of(): EnvConfigRepoImpl {
    dotEnv.config();

    return new EnvConfigRepoImpl();
  };

  mongoDBUrl(): Option<Readonly<MongoDBUrl>> {
    return map(mongoDBUrlOf)(fromNullable(process.env.MONGODB_URL));
  }

  fastifyPort(): Option<Readonly<FastifyPort>> {
    return map(fastifyPortOf)(fromNullable(Number(process.env.FASTIFY_PORT) || 3000));
  }

  runtimeEnv(): Option<Readonly<RuntimeEnv>> {
    return map(runtimeEnvOf)(fromNullable(process.env.ENV));
  }
}

export { EnvConfigRepoImpl, MongoDBUrl, mongoDBUrlOf, fastifyPortOf, FastifyPort, RuntimeEnv, runtimeEnvOf };