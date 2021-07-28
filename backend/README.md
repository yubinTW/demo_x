# Demo X Backend Service

## Fastify test

run `npm run start` to start a Fastify server locally on port `8888` because of
the `FASTIFY_PORT` defined in the .env file.

Please try `curl -v http://localhost:8888/v1/health` to see the result.

## Feature tests

run `npm run test` to run all feature test cases

## Format code by prettier

run this before every commit

```
npm run fix-prettier
```

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

## Run mongo and natsbox for development

### mongo

```
docker run -d -p 27017:27017 --name mongo mongo
```

### natsbox

```
docker run --network nats -d --name natsbox -it synadia/nats-box
```
