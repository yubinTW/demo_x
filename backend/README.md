# Demo X Backend Service

## Fastify test

run `npm run start` to start a Fastify server locally on port `8888` because of
the `FASTIFY_PORT` defined in the .env file.

Please try `curl -v http://localhost:8888/v1/health` to see the result.

## Feature tests

run `npm run test` to run all feature test cases

## API Doc

run `npm run apidoc` to generate backend's RESTful API doc

### Dependency

- docker
- docker-compose

## Build with esbuild

```
npm run esbuild
```

## Run with node
```
node build/http-server/index.js
```